import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { BadRequestError, UnauthenticatedError } from "../errors";
import User from "../models/user.model";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/passwordReset";
import { signJWT } from "../utils/jwt";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      name,
      username,
      email,
      password,
      securityQuestion,
      securityAnswer,
    } = req.body;

    const user = await User.create({
      name,
      username,
      email,
      password,
      securityQuestion,
      securityAnswer,
    });

    const token = signJWT({ userId: user._id.toString(), role: user.role });

    res.status(StatusCodes.CREATED).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const token = signJWT({ userId: user._id.toString(), role: user.role });

    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      throw new BadRequestError("Please provide your email");
    }

    const user = await User.findOne({ email }).select("securityQuestion");

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    res.status(StatusCodes.OK).json({
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    next(error);
  }
};

const verifySecurityAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const securityAnswer = (req.body.securityAnswer || "").trim();

    if (!email || !securityAnswer) {
      throw new BadRequestError("Please provide email and security answer");
    }

    const user = await User.findOne({ email }).select("+securityAnswer");

    if (!user || !(await user.compareSecurityAnswer(securityAnswer))) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    res.status(StatusCodes.OK).json({
      message: "Security answer verified",
      resetToken: createPasswordResetToken(user._id.toString()),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError("Please provide reset token and new password");
    }

    let payload;
    try {
      payload = verifyPasswordResetToken(token);
    } catch {
      throw new UnauthenticatedError("Invalid or expired password reset token");
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new UnauthenticatedError("Invalid or expired password reset token");
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, forgotPassword, verifySecurityAnswer, resetPassword };
