import { io, type Socket } from "socket.io-client";

import type { ProfileConnection } from "./profile";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export type MessageUser = ProfileConnection & {
  lastMessageAt?: string | null;
  unreadCount?: number;
};

type MessageApiUser = Omit<ProfileConnection, "id"> & {
  _id?: string;
  id?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
};

type MessageApiItem = Omit<MessageItem, "sender" | "recipient"> & {
  sender: MessageApiUser;
  recipient: MessageApiUser;
};

export type MessageItem = {
  _id: string;
  sender: MessageUser;
  recipient: MessageUser;
  text: string;
  isRead: boolean;
  createdAt: string;
};

const normalizeUser = (user: MessageApiUser): MessageUser => ({
  id: user.id || user._id || "",
  name: user.name,
  username: user.username,
  avatar: user.avatar,
  bio: user.bio,
  lastMessageAt: user.lastMessageAt,
  unreadCount: user.unreadCount || 0,
});

const normalizeMessage = (message: MessageApiItem): MessageItem => ({
  ...message,
  sender: normalizeUser(message.sender),
  recipient: normalizeUser(message.recipient),
});

const messageRequest = async <T>(
  path: string,
  requestInit: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/messages${path}`, {
    ...requestInit,
    headers: {
      ...requestInit.headers,
      Authorization: `Bearer ${token || ""}`,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load messages");
  }

  return data as T;
};

const getMessageContacts = async (
  requestedUserId?: string,
): Promise<{ users: MessageUser[] }> => {
  const query = requestedUserId
    ? `?userId=${encodeURIComponent(requestedUserId)}`
    : "";
  const response = await messageRequest<{ users: MessageApiUser[] }>(
    `/contacts${query}`,
  );
  return { users: response.users.map(normalizeUser) };
};

const getUnreadMessageCount = (): Promise<{ unreadCount: number }> =>
  messageRequest<{ unreadCount: number }>("/unread-count");

const getConversation = async (
  userId: string,
): Promise<{ messages: MessageItem[] }> => {
  const response = await messageRequest<{ messages: MessageApiItem[] }>(
    `/conversation/${encodeURIComponent(userId)}`,
  );
  return { messages: response.messages.map(normalizeMessage) };
};

const sendMessage = async (
  recipientId: string,
  text: string,
): Promise<{ data: MessageItem }> => {
  const response = await messageRequest<{ data: MessageApiItem }>("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientId, text }),
  });
  return { data: normalizeMessage(response.data) };
};

const connectMessageSocket = (userId: string): Socket => {
  const socket = io(SOCKET_URL, { transports: ["websocket"] });
  socket.on("connect", () => socket.emit("joinRoom", userId));
  return socket;
};

export {
  getMessageContacts,
  getUnreadMessageCount,
  getConversation,
  sendMessage,
  connectMessageSocket,
};
