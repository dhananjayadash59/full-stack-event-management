import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          Campus<span>Events</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Browse events</Link>
          {user && <Link to="/my-bookings">My bookings</Link>}
          {user && user.role === "admin" && <Link to="/admin">Admin dashboard</Link>}
          {user ? (
            <>
              <span className="nav-tag">{user.role}</span>
              <button onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">
                <button className="btn btn-primary" style={{ padding: "8px 16px" }}>
                  Sign up
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
