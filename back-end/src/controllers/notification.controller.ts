import { StatusCodes } from "http-status-codes";

import Notification from "../models/notification.model";
import { NotFoundError, UnauthenticatedError } from "../errors";
import { asyncHandler } from "../utils/asyncHandler";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
  const limit = Math.min(
    50,
    Math.max(1, Math.floor(Number(req.query.limit) || 20)),
  );
  const skip = (page - 1) * limit;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "name username avatar")
      .populate("post", "description photos")
      .populate("comment", "text")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  res.status(StatusCodes.OK).json({
    notifications,
    unreadCount,
    page,
    limit,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: userId },
    { isRead: true },
    { new: true },
  );

  if (!notification) throw new NotFoundError("Notification not found");

  res.status(StatusCodes.OK).json({
    message: "Notification marked as read",
    notification,
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );

  res.status(StatusCodes.OK).json({
    message: "All notifications marked as read",
  });
});

export { getNotifications, markNotificationRead, markAllNotificationsRead };
