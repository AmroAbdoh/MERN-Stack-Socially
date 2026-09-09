import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

import { CustomAPIError } from "../errors";

type ErrorWithDetails = Error & {
  code?: number;
  status?: number;
  type?: string;
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof CustomAPIError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error.name === "ValidationError") {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    return;
  }

  const errorWithDetails = error as ErrorWithDetails;

  if (errorWithDetails.type === "entity.parse.failed") {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid JSON request body",
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Avatar file must be 5 MB or smaller"
          : error.message,
    });
    return;
  }

  if (error.message === "Only image files are allowed") {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    return;
  }

  if (errorWithDetails.code === 11000) {
    res.status(StatusCodes.CONFLICT).json({
      message: "A user with that username or email already exists",
    });
    return;
  }

  console.error(error);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
  });
};
