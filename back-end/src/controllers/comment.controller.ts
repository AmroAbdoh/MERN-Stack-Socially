import { StatusCodes } from "http-status-codes";
import Post from "../models/post.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} from "../errors";
import { asyncHandler } from "../utils/asyncHandler";
import { createNotification } from "../utils/notifications";

const createComment = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const { postId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    throw new BadRequestError("Comment cannot be empty");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    postedBy: userId,
    text: text.trim(),
  });

  await comment.populate("postedBy", "name username avatar");

  await createNotification({
    recipient: post.postedBy,
    sender: userId,
    type: "comment",
    post: post._id,
    comment: comment._id,
  });

  res.status(StatusCodes.CREATED).json({
    message: "Comment created successfully",
    comment: {
      ...comment.toObject(),
      postedBy: {
        id: (comment.postedBy as any)._id,
        name: (comment.postedBy as any).name,
        username: (comment.postedBy as any).username,
        avatar: (comment.postedBy as any).avatar,
      },
    },
  });
});

const getPostComments = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.visibility === "private" && post.postedBy.toString() !== userId) {
    throw new NotFoundError("Post not found");
  }

  const comments = await Comment.find({ post: postId })
    .populate("postedBy", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    comments: comments.map((comment) => ({
      ...comment.toObject(),
      postedBy: {
        id: (comment.postedBy as any)._id,
        name: (comment.postedBy as any).name,
        username: (comment.postedBy as any).username,
        avatar: (comment.postedBy as any).avatar,
      },
    })),
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const { id } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    throw new BadRequestError("Comment cannot be empty");
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  if (comment.postedBy.toString() !== userId) {
    throw new UnauthenticatedError(
      "You are not allowed to update this comment",
    );
  }

  comment.text = text.trim();

  await comment.save();
  await comment.populate("postedBy", "name username avatar");

  res.status(StatusCodes.OK).json({
    message: "Comment updated successfully",
    comment: {
      ...comment.toObject(),
      postedBy: {
        id: (comment.postedBy as any)._id,
        name: (comment.postedBy as any).name,
        username: (comment.postedBy as any).username,
        avatar: (comment.postedBy as any).avatar,
      },
    },
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) throw new NotFoundError("Comment not found");

  const post = await Post.findById(comment.post);

  if (!post) throw new NotFoundError("Post not found");

  if (
    comment.postedBy.toString() !== userId &&
    post.postedBy.toString() !== userId
  ) {
    throw new UnauthenticatedError(
      "You are not allowed to delete this comment",
    );
  }

  await comment.deleteOne();
  await Notification.deleteMany({ comment: comment._id });

  res.status(StatusCodes.OK).json({
    message: "Comment deleted successfully",
  });
});

export { createComment, getPostComments, updateComment, deleteComment };
