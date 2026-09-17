const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  joinWaitlist,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, createBooking);
router.post("/waitlist", protect, joinWaitlist);
router.get("/mine", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
