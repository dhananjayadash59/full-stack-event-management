import React, { useEffect, useState } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

const CATEGORIES = ["All", "Workshop", "Seminar", "Fest", "Sports", "Cultural", "Other"];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { upcoming: "true" };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      const { data } = await api.get("/events", { params });
      setEvents(data);
    } catch (err) {
      setError("Could not load events. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const nextEvent = events[0];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>Every campus event, one ticket booth.</h1>
            <p className="lede">
              Browse workshops, fests, seminars, and matches happening across college — then
              reserve your seat in a couple of taps.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">{events.length}</div>
                <div className="label">Upcoming events</div>
              </div>
              <div className="hero-stat">
                <div className="num">{CATEGORIES.length - 1}</div>
                <div className="label">Categories</div>
              </div>
            </div>
          </div>

          {nextEvent && (
            <div className="hero-ticket">
              <div className="eyebrow">Next up</div>
              <h3>{nextEvent.title}</h3>
              <div className="stub-divider" />
              <div className="meta">
                <span>
                  {new Date(nextEvent.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  &middot; {nextEvent.time}
                </span>
                <span>{nextEvent.venue}</span>
                <span>{nextEvent.totalSeats - nextEvent.bookedSeats} seats remaining</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <div className="section-head" style={{ marginTop: 40 }}>
          <h2>Upcoming events</h2>
          <span className="sub">Book early &mdash; popular events fill up fast</span>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title, description, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading-block">Loading events...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Try a different search term or check back later.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
