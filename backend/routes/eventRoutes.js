const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, adminOnly } = require("../middleware/auth");
const { uploadEventImage } = require("../middleware/upload");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, adminOnly, uploadEventImage.single("image"), createEvent);
router.put("/:id", protect, adminOnly, uploadEventImage.single("image"), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;
