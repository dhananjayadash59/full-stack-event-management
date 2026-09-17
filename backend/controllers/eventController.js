const Event = require("../models/Event");
const Booking = require("../models/Booking");

// @desc    Get all events (supports search, category filter, upcoming-only)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, upcoming } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (upcoming === "true") {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

// @desc    Get a single event by id
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, organizer, imageUrl, totalSeats, price } = req.body;

    if (!title || !description || !date || !time || !venue || !totalSeats) {
      return res.status(400).json({ message: "Please fill in all required event fields" });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      venue,
      organizer,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : imageUrl,
      totalSeats,
      price: price || 0,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updatableFields = [
      "title",
      "description",
      "category",
      "date",
      "time",
      "venue",
      "organizer",
      "imageUrl",
      "totalSeats",
      "price",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    if (req.file) event.imageUrl = `/uploads/${req.file.filename}`;

    const updated = await event.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event", error: err.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    await event.deleteOne();
    await Booking.deleteMany({ event: event._id });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
