const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Waitlist = require("../models/Waitlist");
const QRCode = require("qrcode");
const { sendBookingConfirmation, sendCancellation, sendWaitlistNotice } = require("../config/email");

// @desc    Book seats for an event
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const seatCount = Number(seats) || 1;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }
    if (seatCount < 1) {
      return res.status(400).json({ message: "You must book at least 1 seat" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "This event has already taken place" });
    }

    const existingBooking = await Booking.findOne({
      event: eventId,
      user: req.user._id,
      status: "confirmed",
    });
    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this event" });
    }

    // Atomically reserve seats so two people can't overbook the last spot.
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lte: [{ $add: ["$bookedSeats", seatCount] }, "$totalSeats"] },
      },
      { $inc: { bookedSeats: seatCount } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "Not enough seats available for this event" });
    }

    const booking = await Booking.create({
      event: eventId,
      user: req.user._id,
      seats: seatCount,
    });

    booking.qrCode = await QRCode.toDataURL(`CampusEvents booking ${booking._id}`);
    await booking.save();
    const populated = await booking.populate([{ path: "event" }, { path: "user", select: "name email" }]);
    sendBookingConfirmation(populated).catch((error) => console.error("Booking email failed:", error.message));
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
};

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/mine
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your bookings", error: err.message });
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    await Event.findByIdAndUpdate(booking.event, {
      $inc: { bookedSeats: -booking.seats },
    });

    const populated = await booking.populate([{ path: "event" }, { path: "user", select: "name email" }]);
    sendCancellation(populated).catch((error) => console.error("Cancellation email failed:", error.message));

    const waitlistEntry = await Waitlist.findOneAndUpdate(
      { event: booking.event, status: "waiting", seats: { $lte: booking.seats } },
      { status: "notified", notifiedAt: new Date() },
      { sort: { createdAt: 1 }, new: true }
    ).populate([{ path: "event" }, { path: "user", select: "name email" }]);
    if (waitlistEntry) {
      sendWaitlistNotice(waitlistEntry).catch((error) => console.error("Waitlist email failed:", error.message));
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel booking", error: err.message });
  }
};

// @desc    Get all bookings (admin overview)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("event")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// @desc    Join an event waitlist
// @route   POST /api/bookings/waitlist
// @access  Private
const joinWaitlist = async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const seatCount = Number(seats) || 1;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.bookedSeats < event.totalSeats) return res.status(400).json({ message: "This event still has seats available" });

    const existing = await Waitlist.findOne({ event: eventId, user: req.user._id, status: { $in: ["waiting", "notified"] } });
    if (existing) return res.status(400).json({ message: "You are already on the waitlist" });
    const entry = await Waitlist.create({ event: eventId, user: req.user._id, seats: seatCount });
    res.status(201).json({ message: "You joined the waitlist", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to join waitlist", error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getAllBookings, joinWaitlist };
