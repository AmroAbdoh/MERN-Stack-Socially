import { StatusCodes } from "http-status-codes";

import User from "../models/user.model";
import Post from "../models/post.model";
import { BadRequestError } from "../errors";
import { asyncHandler } from "../utils/asyncHandler";

const getSearchQuery = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError("Search query is required");
  }

  return value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const searchUsers = asyncHandler(async (req, res) => {
  const query = getSearchQuery(req.query.query);

  const users = await User.find({
    $or: [
      {
        username: {
          $regex: query.trim(),
          $options: "i",
        },
      },
      {
        name: {
          $regex: query.trim(),
          $options: "i",
        },
      },
    ],
  })
    .select("name username avatar bio")
    .limit(20);

  res.status(StatusCodes.OK).json({
    users,
  });
});

const searchPosts = asyncHandler(async (req, res) => {
  const query = getSearchQuery(req.query.query);

  const posts = await Post.find({
    description: {
      $regex: query.trim(),
      $options: "i",
    },
    visibility: "public",
  })
    .populate("postedBy", "name username avatar")
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(StatusCodes.OK).json({
    posts,
  });
});

export { searchUsers, searchPosts };
