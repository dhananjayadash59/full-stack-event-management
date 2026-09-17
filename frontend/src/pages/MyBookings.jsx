import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch (err) {
      setError("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setMessage("");
    try {
      await api.delete(`/bookings/${bookingId}`);
      setMessage("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not cancel booking.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My bookings</h1>
        <p className="sub">Everything you&apos;ve reserved a seat for.</p>
      </div>

      <div className="page-body">
        {message && <div className="alert alert-success" style={{ marginBottom: 16 }}>{message}</div>}
        {loading && <div className="loading-block">Loading...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Browse upcoming events and reserve your seat.</p>
            <Link to="/" className="btn btn-dark" style={{ marginTop: 14 }}>
              Browse events
            </Link>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Pass</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <Link to={`/events/${b.event?._id}`} style={{ fontWeight: 600 }}>
                        {b.event?.title || "Event removed"}
                      </Link>
                    </td>
                    <td>
                      {b.status === "confirmed" && b.qrCode && (
                        <div className="ticket-pass">
                          <img src={b.qrCode} alt={`QR entry pass for ${b.event?.title || "booking"}`} width="92" height="92" />
                          <a className="btn btn-outline" href={b.qrCode} download={`campus-events-${b._id}.png`}>Download QR</a>
                        </div>
                      )}
                    </td>
                    <td>{b.event ? new Date(b.event.date).toLocaleDateString() : "—"}</td>
                    <td>{b.event?.venue || "—"}</td>
                    <td>{b.seats}</td>
                    <td>
                      <span className={`badge ${b.status === "confirmed" ? "badge-confirmed" : "badge-cancelled"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === "confirmed" && (
                        <button className="btn btn-danger" onClick={() => handleCancel(b._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
