import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get("/events"),
        api.get("/bookings"),
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError("Could not load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event and all its bookings? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${eventId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete event.");
    }
  };

  const totalSeatsBooked = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.seats, 0);
  const categoryTotals = events.map((event) => ({
    category: event.category,
    seats: bookings.filter((booking) => booking.event?._id === event._id && booking.status === "confirmed").reduce((sum, booking) => sum + booking.seats, 0),
  })).reduce((totals, item) => {
    const existing = totals.find((entry) => entry.category === item.category);
    if (existing) existing.seats += item.seats;
    else totals.push(item);
    return totals;
  }, []);
  const chartMax = Math.max(...categoryTotals.map((item) => item.seats), 1);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>Admin dashboard</h1>
            <p className="sub">Manage events and monitor bookings.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/admin/events/new")}>
            + Create event
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading && <div className="loading-block">Loading...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="num">{events.length}</div>
                <div className="label">Total events</div>
              </div>
              <div className="stat-card">
                <div className="num">{bookings.filter((b) => b.status === "confirmed").length}</div>
                <div className="label">Active bookings</div>
              </div>
              <div className="stat-card">
                <div className="num">{totalSeatsBooked}</div>
                <div className="label">Seats reserved</div>
              </div>
            </div>

            <div className="analytics-panel">
              <div className="section-head" style={{ marginTop: 0 }}>
                <h2 style={{ fontSize: 22 }}>Bookings by category</h2>
                <span className="sub">Confirmed seats</span>
              </div>
              <div className="bar-chart" aria-label="Confirmed bookings by category">
                {categoryTotals.map((item) => (
                  <div className="bar-chart-item" key={item.category}>
                    <div className="bar-chart-value">{item.seats}</div>
                    <div className="bar-chart-track"><div className="bar-chart-bar" style={{ height: `${Math.max((item.seats / chartMax) * 100, item.seats ? 8 : 2)}%` }} /></div>
                    <div className="bar-chart-label">{item.category}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-head" style={{ marginTop: 0 }}>
              <h2 style={{ fontSize: 22 }}>Events</h2>
            </div>
            <div className="table-wrap" style={{ marginBottom: 40 }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Seats</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id}>
                      <td>
                        <Link to={`/events/${ev._id}`} style={{ fontWeight: 600 }}>
                          {ev.title}
                        </Link>
                      </td>
                      <td>{ev.category}</td>
                      <td>{new Date(ev.date).toLocaleDateString()}</td>
                      <td>
                        {ev.bookedSeats} / {ev.totalSeats}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button onClick={() => navigate(`/admin/events/${ev._id}/edit`)}>Edit</button>
                          <button onClick={() => handleDelete(ev._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--slate)" }}>
                        No events yet. Create your first one above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="section-head" style={{ marginTop: 0 }}>
              <h2 style={{ fontSize: 22 }}>Recent bookings</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Seats</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 20).map((b) => (
                    <tr key={b._id}>
                      <td>
                        {b.user?.name}
                        <div style={{ fontSize: 12, color: "var(--slate)" }}>{b.user?.email}</div>
                      </td>
                      <td>{b.event?.title || "Event removed"}</td>
                      <td>{b.seats}</td>
                      <td>
                        <span className={`badge ${b.status === "confirmed" ? "badge-confirmed" : "badge-cancelled"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "var(--slate)" }}>
                        No bookings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
