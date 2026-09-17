// Run with: npm run seed
// Creates one admin account and a handful of sample events so the app
// has content to show right after deployment.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Event = require("./models/Event");
const Booking = require("./models/Booking");

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Booking.deleteMany();
  await Event.deleteMany();
  await User.deleteMany();

  // Hidden dev/admin seed account used only for setup; not shown in the frontend UI.
  console.log("Creating admin account...");
  const admin = await User.create({
    name: "Event Admin",
    email: "lala@gmail.com",
    password: "lala@123456",
    role: "admin",
  });

  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const in14 = new Date();
  in14.setDate(in14.getDate() + 14);
  const in21 = new Date();
  in21.setDate(in21.getDate() + 21);
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  console.log("Creating sample events...");
  await Event.insertMany([
    {
      title: "AI & Machine Learning Workshop",
      description:
        "A hands-on workshop covering the fundamentals of machine learning, neural networks, and practical projects using Python. Open to all departments.",
      category: "Workshop",
      date: in7,
      time: "10:00 AM",
      venue: "Computer Science Auditorium",
      organizer: "CS Department",
      totalSeats: 80,
      bookedSeats: 12,
      price: 0,
      createdBy: admin._id,
    },
    {
      title: "Annual Cultural Fest - Ushindi",
      description:
        "The college's flagship cultural festival featuring music, dance, drama, and art competitions from colleges across the region.",
      category: "Fest",
      date: in21,
      time: "9:00 AM",
      venue: "Main Campus Ground",
      organizer: "Cultural Committee",
      totalSeats: 500,
      bookedSeats: 210,
      price: 50,
      createdBy: admin._id,
    },
    {
      title: "Career Guidance Seminar",
      description:
        "Industry experts discuss career paths, interview preparation, and resume building for final-year students.",
      category: "Seminar",
      date: in14,
      time: "2:00 PM",
      venue: "Seminar Hall B",
      organizer: "Placement Cell",
      totalSeats: 150,
      bookedSeats: 45,
      price: 0,
      createdBy: admin._id,
    },
    {
      title: "Inter-College Basketball Tournament",
      description:
        "Cheer for your college team in the annual inter-college basketball championship finals.",
      category: "Sports",
      date: in30,
      time: "4:00 PM",
      venue: "Sports Complex",
      organizer: "Sports Department",
      totalSeats: 300,
      bookedSeats: 90,
      price: 20,
      createdBy: admin._id,
    },
  ]);

  console.log("Seed complete!");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
