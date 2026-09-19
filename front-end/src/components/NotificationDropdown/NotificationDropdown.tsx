import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../../services/notifications";
import { getAssetUrl } from "../../services/profile";

import "./notificationDropdown.css";

type NotificationDropdownProps = {
  onUnreadCountChange: (count: number) => void;
  onClose: () => void;
};

const getNotificationText = (notification: NotificationItem): string => {
  if (notification.type === "follow") return "started following you";
  if (notification.type === "like") return "liked your post";
  return "commented on your post";
};

function NotificationDropdown({
  onUnreadCountChange,
  onClose,
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await getNotifications();
        setNotifications(response.notifications);
        onUnreadCountChange(response.unreadCount);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load notifications.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [onUnreadCountChange]);

  const selectNotification = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );
        onUnreadCountChange(Math.max(0, notifications.filter((item) => !item.isRead).length - 1));
      } catch {
        // Navigation remains useful even if marking read fails.
      }
    }

    onClose();
    if (notification.type === "follow") {
      navigate(`/profile/${encodeURIComponent(notification.sender.username)}`);
    } else if (notification.post?._id) {
      navigate(`/post/${encodeURIComponent(notification.post._id)}`);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      onUnreadCountChange(0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update notifications.",
      );
    }
  };

  const openSenderProfile = async (
    event: React.MouseEvent,
    notification: NotificationItem,
  ) => {
    event.stopPropagation();
    if (!notification.isRead) {
      await markNotificationRead(notification._id).catch(() => undefined);
    }
    onClose();
    navigate(`/profile/${encodeURIComponent(notification.sender.username)}`);
  };

  return (
    <div className="notification-dropdown" role="dialog" aria-label="Notifications">
      <div className="notification-dropdown__heading">
        <strong>Notifications</strong>
        <button type="button" onClick={markAllRead} disabled={!notifications.some((item) => !item.isRead)}>
          Mark all read
        </button>
      </div>
      {isLoading ? (
        <p className="notification-dropdown__message">Loading...</p>
      ) : errorMessage ? (
        <p className="notification-dropdown__message notification-dropdown__message--error">
          {errorMessage}
        </p>
      ) : notifications.length === 0 ? (
        <p className="notification-dropdown__message">No notifications yet.</p>
      ) : (
        <div className="notification-dropdown__list">
          {notifications.map((notification) => (
            <div
              role="button"
              tabIndex={0}
              className={`notification-dropdown__item${notification.isRead ? "" : " is-unread"}`}
              key={notification._id}
              onClick={() => selectNotification(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectNotification(notification);
                }
              }}
            >
              <button
                type="button"
                className="notification-dropdown__avatar"
                onClick={(event) => openSenderProfile(event, notification)}
                aria-label={`Open ${notification.sender.name}'s profile`}
              >
                {notification.sender.avatar ? (
                  <img src={getAssetUrl(notification.sender.avatar)} alt="" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                  </svg>
                )}
              </button>
              <span className="notification-dropdown__text">
                <strong>{notification.sender.name}</strong> {getNotificationText(notification)}
                <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
              </span>
              {!notification.isRead && <span className="notification-dropdown__dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
