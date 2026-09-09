import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors";
import User from "../models/user.model";

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
  } catch (error) {
    next(error);
  }
};

const followUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { username } = req.params;

    if (!userId) throw new UnauthenticatedError("Authentication Invalid");

    const targetUser = await User.findOne({ username });

    if (!targetUser) throw new UnauthenticatedError("user not found");

    if (targetUser._id.toString() === userId) {
      throw new BadRequestError("You cannot follow yourself");
    }

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

    res.status(StatusCodes.OK).json({
      message: "User followed successfully",
      following: true,
    });
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
    ]);

    res.status(StatusCodes.OK).json({
      message: "User unfollowed successfully",
      following: false,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getCurrentUser,
  getUserByUsername,
  updateProfile,
  updateAvatar,
  followUser,
  unfollowUser,
};
