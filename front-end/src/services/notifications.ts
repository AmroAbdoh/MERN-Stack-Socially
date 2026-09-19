import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export type NotificationUser = {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
};

export type NotificationItem = {
  _id: string;
  type: "follow" | "like" | "comment";
  isRead: boolean;
  createdAt: string;
  sender: NotificationUser;
  post?: { _id: string };
};

const notificationRequest = async <T>(
  path: string,
  requestInit: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/notifications${path}`, {
    ...requestInit,
    headers: {
      ...requestInit.headers,
      Authorization: `Bearer ${token || ""}`,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load notifications");
  }

  return data as T;
};

const getNotifications = (): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> => notificationRequest("/?page=1&limit=20");

const markNotificationRead = (id: string) =>
  notificationRequest(`/${id}/read`, { method: "PATCH" });

const markAllNotificationsRead = () =>
  notificationRequest("/read-all", { method: "PATCH" });

const connectNotificationSocket = (userId: string): Socket => {
  const socket = io(SOCKET_URL, { transports: ["websocket"] });
  socket.on("connect", () => socket.emit("joinNotifications", userId));
  return socket;
};

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  connectNotificationSocket,
};