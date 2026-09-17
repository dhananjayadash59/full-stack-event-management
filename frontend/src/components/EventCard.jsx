import React from "react";
import { Link } from "react-router-dom";
import { API_ORIGIN } from "../api/axios";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const EventCard = ({ event }) => {
  const available = event.totalSeats - event.bookedSeats;
  const lowSeats = available <= event.totalSeats * 0.15 && available > 0;
  const soldOut = available <= 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      {event.imageUrl && <img className="event-card-image" src={event.imageUrl.startsWith("http") ? event.imageUrl : `${API_ORIGIN}${event.imageUrl}`} alt="" />}
      <div className="event-card-top">
        <span className="category-tag">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="desc">{event.description}</p>
      </div>
      <div className="event-card-body">
        <div className="event-meta-row">
          <span className="icon">&#128197;</span>
          {formatDate(event.date)} &middot; {event.time}
        </div>
        <div className="event-meta-row">
          <span className="icon">&#128205;</span>
          {event.venue}
        </div>
      </div>
      <div className="event-card-foot">
        <span className={`seats-left ${lowSeats || soldOut ? "seats-low" : ""}`}>
          {soldOut ? "Sold out" : <><strong>{available}</strong> seats left</>}
        </span>
        <span style={{ fontWeight: 700 }}>{event.price > 0 ? `₹${event.price}` : "Free"}</span>
      </div>
    </Link>
  );
};

export default EventCard;
