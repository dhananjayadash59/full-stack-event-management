const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seats: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ["waiting", "notified", "fulfilled", "cancelled"], default: "waiting" },
    notifiedAt: Date,
  },
  { timestamps: true }
);

waitlistSchema.index({ event: 1, user: 1 }, { unique: true });
waitlistSchema.index({ event: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model("Waitlist", waitlistSchema);
