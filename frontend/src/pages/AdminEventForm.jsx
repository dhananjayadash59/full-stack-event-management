import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = ["Workshop", "Seminar", "Fest", "Sports", "Cultural", "Other"];

const emptyForm = {
  title: "",
  description: "",
  category: "Workshop",
  date: "",
  time: "",
  venue: "",
  organizer: "",
  imageUrl: "",
  totalSeats: 50,
  price: 0,
};

const AdminEventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setForm({
          ...data,
          date: data.date ? data.date.substring(0, 10) : "",
        });
      } catch (err) {
        setError("Could not load event.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries({ ...form, totalSeats: Number(form.totalSeats), price: Number(form.price) || 0 }).forEach(([key, value]) => {
        if (key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "bookedSeats") payload.append(key, value ?? "");
      });
      if (image) payload.append("image", image);
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save event.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-block">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? "Edit event" : "Create a new event"}</h1>
        <p className="sub">Fill in the details students will see on the event page.</p>
      </div>

      <div className="page-body" style={{ maxWidth: 760 }}>
        <div className="details-card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="title">Event title</label>
              <input id="title" name="title" required value={form.title} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" required value={form.description} onChange={handleChange} />
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="venue">Venue</label>
                <input id="venue" name="venue" required value={form.venue} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" required value={form.date} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="time">Time</label>
                <input id="time" name="time" required placeholder="e.g. 10:00 AM" value={form.time} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="totalSeats">Total seats</label>
                <input
                  id="totalSeats"
                  name="totalSeats"
                  type="number"
                  min={1}
                  required
                  value={form.totalSeats}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="price">Price (₹, 0 = free)</label>
                <input id="price" name="price" type="number" min={0} value={form.price} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="organizer">Organizer</label>
                <input id="organizer" name="organizer" value={form.organizer} onChange={handleChange} placeholder="e.g. CS Department" />
              </div>
              <div className="field">
                <label htmlFor="image">Event poster (optional, max 5 MB)</label>
                <input id="image" name="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                <small style={{ color: "var(--slate)" }}>You can also keep an existing image URL.</small>
              </div>
              <div className="field">
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input id="imageUrl" name="imageUrl" value={form.imageUrl || ""} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save changes" : "Create event"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEventForm;
