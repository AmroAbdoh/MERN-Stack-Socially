import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./navbar.css";

import SearchField from "../SearchField/SearchField";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import ThemeLogo from "../ThemeLogo/ThemeLogo";
import {
  getAssetUrl,
  getCurrentProfile,
  getCurrentProfilePath,
} from "../../services/profile";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [avatar, setAvatar] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = Boolean(localStorage.getItem("token"));
      setIsLoggedIn(loggedIn);
      if (!loggedIn) setAvatar("");
    };

    const loadAvatar = async () => {
      if (!localStorage.getItem("token")) return;

      try {
        const response = await getCurrentProfile();
        setAvatar(response.user.avatar || "");
      } catch {
        setAvatar("");
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("profilechange", loadAvatar);
    document.addEventListener("mousedown", handleClickOutside);
    loadAvatar();

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("profilechange", loadAvatar);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setAvatar("");
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
        <ThemeLogo className="navbar__brand-logo" alt="Socially logo" />
        <span>Socially</span>
      </button>

      <div className="navbar__links" aria-label="Primary navigation">
        <SearchField />
      </div>

      <div className="navbar__actions">
        <ThemeToggle />
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="navbar__profile-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4-.983L2 17l1.983-3.017A6.979 6.979 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                {/* Message */}
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="navbar__profile-button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                {/* Notification */}
              </svg>
            </button>
            <div className="navbar__profile-wrapper" ref={menuRef}>
              <button
                type="button"
                className={`navbar__profile-button${avatar ? " navbar__profile-button--avatar" : ""}`}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                {avatar ? (
                  <img
                    className="navbar__avatar"
                    src={`${getAssetUrl(avatar)}?v=${encodeURIComponent(avatar)}`}
                    alt=""
                  />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                  </svg>
                )}
              </button>

              {isMenuOpen && (
                <div className="navbar__dropdown">
                  <button
                    type="button"
                    className="navbar__dropdown-item"
                    onClick={() => navigate(getCurrentProfilePath())}
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
          </>
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
