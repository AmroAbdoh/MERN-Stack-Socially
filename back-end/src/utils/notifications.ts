import mongoose from "mongoose";

import Notification, { NotificationType } from "../models/notification.model";
import { getSocketIO } from "../sockets";

interface CreateNotificationOptions {
  recipient: mongoose.Types.ObjectId | string;
  sender: mongoose.Types.ObjectId | string;
  type: NotificationType;
  post?: mongoose.Types.ObjectId | string;
  comment?: mongoose.Types.ObjectId | string;
}

const createNotification = async ({
  recipient,
  sender,
  type,
  post,
  comment,
}: CreateNotificationOptions): Promise<void> => {
  if (recipient.toString() === sender.toString()) return;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    comment,
  });

  try {
    const io = getSocketIO();
    const recipientId = recipient.toString();

    await notification.populate("sender", "name username avatar");
    await notification.populate("post", "description photos");
    await notification.populate("comment", "text");

    io.to(recipientId).emit("newNotification", {
      notification,
    });
  } catch (error) {
    console.warn("Socket notification emit failed:", error);
  }
};

export { createNotification };
