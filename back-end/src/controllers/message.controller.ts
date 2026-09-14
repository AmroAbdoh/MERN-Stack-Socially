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

export { sendMessage, getConversation };
