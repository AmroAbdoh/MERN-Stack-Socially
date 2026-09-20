import { StatusCodes } from "http-status-codes";

import User from "../models/user.model";
import Message from "../models/message.model";
import {
  NotFoundError,
  UnauthenticatedError,
  BadRequestError,
} from "../errors";
import { asyncHandler } from "../utils/asyncHandler";
import { getSocketIO } from "../sockets";

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user?.userId;

  if (!senderId) throw new UnauthenticatedError("Authentication invalid");

  const { recipientId, text } = req.body;

  if (!recipientId) {
    throw new BadRequestError("recipientId is required");
  }

  if (!text?.trim()) {
    throw new BadRequestError("Message text is required");
  }

  const recipient = await User.findById(recipientId);

  if (!recipient) {
    throw new NotFoundError("Recipient not found");
  }

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    text: text.trim(),
  });

  const populated = await Message.findById(message._id)
    .populate("sender", "name username avatar")
    .populate("recipient", "name username avatar");

  const io = getSocketIO();

  io.to(recipientId).emit("newMessage", {
    message: populated,
  });

  io.to(senderId).emit("newMessage", {
    message: populated,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Message sent successfully",
    data: populated,
  });
});

const getConversation = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const { userId: otherUserId } = req.params;

  await Message.updateMany(
    { sender: otherUserId, recipient: userId, isRead: false },
    { isRead: true },
  );

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: otherUserId },
      { sender: otherUserId, recipient: userId },
    ],
  })
    .populate("sender", "name username avatar")
    .populate("recipient", "name username avatar")
    .sort({ createdAt: 1 });

  res.status(StatusCodes.OK).json({
    messages,
  });
});

const getUnreadMessageCount = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const unreadCount = await Message.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.status(StatusCodes.OK).json({ unreadCount });
});

const getMessageContacts = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const requestedUserId =
    typeof req.query.userId === "string" ? req.query.userId : "";

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const currentUser = await User.findById(userId).select("following");
  if (!currentUser) throw new UnauthenticatedError("User not found");

  const conversationUserIds = await Message.distinct("sender", {
    recipient: userId,
  });
  const sentToUserIds = await Message.distinct("recipient", {
    sender: userId,
  });
  const contactIds = [
    ...new Set([
      ...currentUser.following.map((id) => id.toString()),
      ...conversationUserIds.map((id) => id.toString()),
      ...sentToUserIds.map((id) => id.toString()),
      ...(requestedUserId ? [requestedUserId] : []),
    ]),
  ];

  const users = await User.find({ _id: { $in: contactIds } }).select(
    "name username avatar bio",
  );

  const contacts = await Promise.all(
    users.map(async (user) => {
      const contactId = user._id.toString();
      const [lastMessage, unreadCount] = await Promise.all([
        Message.findOne({
          $or: [
            { sender: userId, recipient: contactId },
            { sender: contactId, recipient: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .select("createdAt")
          .lean(),
        Message.countDocuments({
          sender: contactId,
          recipient: userId,
          isRead: false,
        }),
      ]);

      return {
        ...user.toObject(),
        lastMessageAt: lastMessage?.createdAt || null,
        unreadCount,
      };
    }),
  );

  contacts.sort((first, second) => {
    if (!first.lastMessageAt && !second.lastMessageAt) return 0;
    if (!first.lastMessageAt) return 1;
    if (!second.lastMessageAt) return -1;
    return (
      new Date(second.lastMessageAt).getTime() -
      new Date(first.lastMessageAt).getTime()
    );
  });

  res.status(StatusCodes.OK).json({
    users: contacts,
  });
});

export {
  sendMessage,
  getConversation,
  getUnreadMessageCount,
  getMessageContacts,
};
