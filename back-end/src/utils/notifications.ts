import mongoose from "mongoose";

import Notification, { NotificationType } from "../models/notification.model";

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

  await Notification.create({
    recipient,
    sender,
    type,
    post,
    comment,
  });
};

export { createNotification };
