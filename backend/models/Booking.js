const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    qrCode: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent the same user from double-booking the same event while a booking is active
bookingSchema.index({ event: 1, user: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
