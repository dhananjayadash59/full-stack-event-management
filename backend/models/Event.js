const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    category: {
      type: String,
      enum: ["Workshop", "Seminar", "Fest", "Sports", "Cultural", "Other"],
      default: "Other",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: [true, "Event time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    organizer: {
      type: String,
      default: "College Committee",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0, // 0 = free event
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.bookedSeats;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
