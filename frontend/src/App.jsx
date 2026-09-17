import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEventForm from "./pages/AdminEventForm";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <PrivateRoute adminOnly>
              <AdminEventForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/events/:id/edit"
          element={
            <PrivateRoute adminOnly>
              <AdminEventForm />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="footer">
        Built for the college event booking demo &mdash; <span>CampusEvents</span> MERN stack project
      </footer>
    </>
  );
}

export default App;
