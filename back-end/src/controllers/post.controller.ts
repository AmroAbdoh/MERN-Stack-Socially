import { StatusCodes } from "http-status-codes";

import Post from "../models/post.model";
import User from "../models/user.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors";
import { asyncHandler } from "../utils/asyncHandler";
import { createNotification } from "../utils/notifications";

const createPost = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const { description, photos, visibility } = req.body;

  if (!description?.trim() && (!photos || photos.length === 0))
    throw new BadRequestError(
      "Post must contain a description or at least one photo",
    );

  const post = await Post.create({
    postedBy: userId,
    description,
    photos,
    visibility,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Posted Created successfully",
    post,
  });
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ visibility: "public" })
    .populate("postedBy", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    posts,
  });
});

const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const posts = await Post.find({ postedBy: userId })
    .populate("postedBy", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    posts,
  });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).select("_id");

  if (!user) throw new NotFoundError("User not found");

  const posts = await Post.find({ postedBy: user._id, visibility: "public" })
    .populate("postedBy", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    posts,
  });
});

const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const post = await Post.findById(id);

  if (!post) throw new NotFoundError("Post not found");

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  await post.populate("postedBy", "name username avatar");

  res.status(StatusCodes.OK).json({
    post,
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  const { id } = req.params;
  const { description, photos, visibility } = req.body;

  const post = await Post.findById(id);

  if (!post) throw new NotFoundError("Post not found");

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  if (post.postedBy.toString() !== userId)
    throw new UnauthenticatedError("You are not allowed to update this post");

  if (description !== undefined) post.description = description;

  if (photos !== undefined) post.photos = photos;

  if (visibility !== undefined) post.visibility = visibility;

  if (!post.description?.trim() && post.photos.length === 0)
    throw new BadRequestError(
      "Post must contain a description or at least one photo",
    );

  await post.save();

  res.status(StatusCodes.OK).json({
    message: "Post updated successfully",
    post,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) throw new NotFoundError("Post not found");

  if (post.postedBy.toString() !== userId)
    throw new UnauthenticatedError("You are not allowed to delete this post");

  await Comment.deleteMany({ post: post._id });
  await Notification.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(StatusCodes.OK).json({
    message: "Post deleted successfully",
  });
});

const likePost = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) throw new NotFoundError("Post not found");

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  const alreadyLiked = post.likedBy.some((user) => user.toString() === userId);

  if (alreadyLiked) throw new BadRequestError("Post already liked");

  post.likedBy.push(userId as any);

  await post.save();

  await createNotification({
    recipient: post.postedBy,
    sender: userId,
    type: "like",
    post: post._id,
  });

  res.status(StatusCodes.OK).json({
    message: "Post liked successfully",
    likesCount: post.likedBy.length,
  });
});

const unlikePost = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication invalid");

  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) throw new NotFoundError("Post not found");

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  const alreadyLiked = post.likedBy.some((user) => user.toString() === userId);

  if (!alreadyLiked) throw new BadRequestError("Post is not liked");

  post.likedBy = post.likedBy.filter((user) => user.toString() !== userId);

  await post.save();
  await Notification.deleteOne({
    recipient: post.postedBy,
    sender: userId,
    type: "like",
    post: post._id,
  });

  res.status(StatusCodes.OK).json({
    message: "Post unliked successfully",
    likesCount: post.likedBy.length,
  });
});

export {
  createPost,
  getPosts,
  getMyPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
