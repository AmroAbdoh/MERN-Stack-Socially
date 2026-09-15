import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("storage", syncAuthState);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar__brand"
        onClick={() => navigate("/")}
      >
        <img src="/logo.png" alt="" />
        <span>Socially</span>
      </button>

      <div className="navbar__links" aria-label="Primary navigation">
        <button type="button" onClick={() => navigate("/")}>
          Home
        </button>
        <button type="button" onClick={() => navigate("/messages")}>
          Messages
        </button>
        <button type="button" onClick={() => navigate("/notifications")}>
          Notifications
        </button>
      </div>

      <div className="navbar__actions">
        {isLoggedIn ? (
          <div className="navbar__profile-wrapper" ref={menuRef}>
            <button
              type="button"
              className="navbar__profile-button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open profile menu"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="navbar__dropdown">
                <button
                  type="button"
                  className="navbar__dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </button>

                <button
                  type="button"
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="navbar__link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
