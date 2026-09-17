import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { API_ORIGIN } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState(false);
  const [waitlisting, setWaitlisting] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError("Event not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlist = async () => {
    if (!user) return navigate("/login");
    setError("");
    setWaitlisting(true);
    try {
      const { data } = await api.post("/bookings/waitlist", { eventId: id, seats });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not join the waitlist.");
    } finally {
      setWaitlisting(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setSuccess("");
    setBooking(true);
    try {
      await api.post("/bookings", { eventId: id, seats });
      setSuccess("Your seat is booked! Check 'My bookings' for details.");
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete booking.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-block">Loading event...</div>;
  if (!event) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <h3>Event not found</h3>
          <Link to="/" className="btn btn-dark" style={{ marginTop: 12 }}>
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const available = event.totalSeats - event.bookedSeats;
  const soldOut = available <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="page">
      <div className="details-hero">
        <div className="container">
          {event.imageUrl && <img className="details-hero-image" src={event.imageUrl.startsWith("http") ? event.imageUrl : `${API_ORIGIN}${event.imageUrl}`} alt="" />}
          <span className="category-tag">{event.category}</span>
          <h1>{event.title}</h1>
        </div>
      </div>

      <div className="details-grid">
        <div>
          <div className="details-card">
            <h3>About this event</h3>
            <p style={{ marginTop: 12, color: "var(--slate)" }}>{event.description}</p>

            <div className="info-grid">
              <div className="info-item">
                <div className="label">Date</div>
                <div className="value">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="info-item">
                <div className="label">Time</div>
                <div className="value">{event.time}</div>
              </div>
              <div className="info-item">
                <div className="label">Venue</div>
                <div className="value">{event.venue}</div>
              </div>
              <div className="info-item">
                <div className="label">Organizer</div>
                <div className="value">{event.organizer}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-panel">
          <div className="details-card">
            <div className="price-row">
              <span className="price">{event.price > 0 ? `₹${event.price}` : "Free"}</span>
              <span className="seats-left">
                <strong>{Math.max(available, 0)}</strong> / {event.totalSeats} seats left
              </span>
            </div>

            {!isPast && !soldOut && (
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="seats">Number of seats</label>
                <input
                  id="seats"
                  type="number"
                  min={1}
                  max={Math.max(available, 1)}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 18 }}
              disabled={soldOut || isPast || booking}
              onClick={handleBook}
            >
              {isPast ? "Event has ended" : soldOut ? "Sold out" : booking ? "Booking..." : "Book my seat"}
            </button>

            {soldOut && !isPast && (
              <button className="btn btn-outline btn-block" style={{ marginTop: 10 }} disabled={waitlisting} onClick={handleWaitlist}>
                {waitlisting ? "Joining..." : "Join waitlist"}
              </button>
            )}

            {!user && <p style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 10 }}>You'll need to log in first.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
