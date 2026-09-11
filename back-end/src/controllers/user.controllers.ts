import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { createNotification } from "../utils/notifications";

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new UnauthenticatedError("user no longer exists");
  }

  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) throw new UnauthenticatedError("user not found");

  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const { name, username, bio } = req.body;

  const user = await User.findById(userId);

  if (!user) throw new UnauthenticatedError("user not found");

  if (name !== undefined) user.name = name;

  if (username !== undefined) user.username = username;

  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.status(StatusCodes.OK).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  if (!req.file) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please upload an image file",
    });
    return;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: `/uploads/avatars/${req.file.filename}` },
    { new: true, runValidators: true },
  );

  if (!user) throw new UnauthenticatedError("user not found");

  res.status(StatusCodes.OK).json({
    message: "Avatar updated successfully",
    avatar: user.avatar,
  });
});

const followUser = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { username } = req.params;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const targetUser = await User.findOne({ username });

  if (!targetUser) throw new UnauthenticatedError("user not found");

  if (targetUser._id.toString() === userId) {
    throw new BadRequestError("You cannot follow yourself");
  }

  const wasFollowing = targetUser.followers.some(
    (follower) => follower.toString() === userId,
  );

  await Promise.all([
    User.updateOne(
      { _id: userId },
      { $addToSet: { following: targetUser._id } },
    ),
    User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { followers: userId } },
    ),
  ]);

  if (!wasFollowing) {
    await createNotification({
      recipient: targetUser._id,
      sender: userId,
      type: "follow",
    });
  }

  res.status(StatusCodes.OK).json({
    message: "User followed successfully",
    following: true,
  });
});

const unfollowUser = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { username } = req.params;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const targetUser = await User.findOne({ username });

  if (!targetUser) throw new UnauthenticatedError("user not found");

  if (targetUser._id.toString() === userId) {
    throw new BadRequestError("You cannot unfollow yourself");
  }

  await Promise.all([
    User.updateOne({ _id: userId }, { $pull: { following: targetUser._id } }),
    User.updateOne({ _id: targetUser._id }, { $pull: { followers: userId } }),
    Notification.deleteOne({
      recipient: targetUser._id,
      sender: userId,
      type: "follow",
    }),
  ]);

  res.status(StatusCodes.OK).json({
    message: "User unfollowed successfully",
    following: false,
  });
});

export {
  getCurrentUser,
  getUserByUsername,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
};
