import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./navbar.css";

import SearchField from "../SearchField/SearchField";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import ThemeLogo from "../ThemeLogo/ThemeLogo";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";
import {
  connectNotificationSocket,
  getNotifications,
} from "../../services/notifications";
import {
  connectMessageSocket,
  getUnreadMessageCount,
} from "../../services/messaging";
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
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    let disconnectNotifications: (() => void) | undefined;
    let disconnectMessages: (() => void) | undefined;

    const syncAuthState = () => {
      const loggedIn = Boolean(localStorage.getItem("token"));
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setAvatar("");
        setUnreadMessageCount(0);
        setUnreadNotificationCount(0);
      }
    };

    const loadAvatar = async () => {
      if (!localStorage.getItem("token")) return;

      try {
        const response = await getCurrentProfile();
        setAvatar(response.user.avatar || "");
        const notifications = await getNotifications();
        setUnreadNotificationCount(notifications.unreadCount);
        const messages = await getUnreadMessageCount();
        setUnreadMessageCount(messages.unreadCount);

        const socket = connectNotificationSocket(response.user.id);
        const handleNewNotification = () => {
          void getNotifications().then((latest) => {
            setUnreadNotificationCount(latest.unreadCount);
          });
        };
        socket.on("newNotification", handleNewNotification);

        disconnectNotifications = () => {
          socket.off("newNotification", handleNewNotification);
          socket.emit("leaveNotifications", response.user.id);
          socket.disconnect();
        };

        const messageSocket = connectMessageSocket(response.user.id);
        const handleNewMessage = () => {
          void getUnreadMessageCount().then((latest) => {
            setUnreadMessageCount(latest.unreadCount);
          });
        };
        messageSocket.on("newMessage", handleNewMessage);
        disconnectMessages = () => {
          messageSocket.off("newMessage", handleNewMessage);
          messageSocket.emit("leaveRoom", response.user.id);
          messageSocket.disconnect();
        };
      } catch {
        setAvatar("");
        setUnreadNotificationCount(0);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedProfileMenu = menuRef.current?.contains(target);
      const clickedNotifications = notificationRef.current?.contains(target);

      if (!clickedProfileMenu && !clickedNotifications) {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("profilechange", loadAvatar);
    document.addEventListener("mousedown", handleClickOutside);
    void loadAvatar();

    return () => {
      disconnectNotifications?.();
      disconnectMessages?.();
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("profilechange", loadAvatar);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleMessagesRead = () => setUnreadMessageCount(0);
    window.addEventListener("messagesread", handleMessagesRead);
    return () => window.removeEventListener("messagesread", handleMessagesRead);
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
    setIsNotificationsOpen(false);
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
            <div className="navbar__message-wrapper">
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className="navbar__profile-button"
                aria-label="Open messages"
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
              {unreadMessageCount > 0 && (
                <span className="navbar__notification-badge">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
              )}
              </button>
            </div>
              <div className="navbar__notification-wrapper" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen((previous) => !previous);
                    setIsMenuOpen(false);
                  }}
                  className="navbar__profile-button"
                  aria-label="Open notifications"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                  {unreadNotificationCount > 0 && (
                    <span className="navbar__notification-badge">
                      {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <NotificationDropdown
                    onUnreadCountChange={setUnreadNotificationCount}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                )}
              </div>
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
