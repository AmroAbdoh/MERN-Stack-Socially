import { StatusCodes } from "http-status-codes";

import User from "../models/user.model";
import Post from "../models/post.model";
import Comment from "../models/comment.model";
import { UnauthenticatedError, NotFoundError } from "../errors";
import { asyncHandler } from "../utils/asyncHandler";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) throw new UnauthenticatedError("Authentication Invalid");

  const user = await User.findById(userId).select("following");

  if (!user) throw new NotFoundError("User not found");

  const requestedPage = Number(req.query.page) || 1;
  const requestedLimit = Number(req.query.limit) || DEFAULT_LIMIT;
  const page = Math.max(1, Math.floor(requestedPage));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(requestedLimit)));
  const skip = (page - 1) * limit;
  const feedUsers = [user._id, ...user.following];
  const feedFilter = {
    postedBy: { $in: feedUsers },
    visibility: "public" as const,
  };

  const [posts, totalPosts] = await Promise.all([
    Post.find(feedFilter)
      .populate("postedBy", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(feedFilter),
  ]);

  const postIds = posts.map((post) => post._id);
  const commentCounts = await Comment.aggregate<{ _id: string; count: number }>(
    [
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ],
  );
  const commentCountByPost = new Map(
    commentCounts.map((item) => [item._id.toString(), item.count]),
  );

  const feedPosts = posts.map((post) => {
    const postData = post.toObject();
    const populatedAuthor = post.postedBy as unknown as {
      _id?: { toString: () => string };
    };
    const postedById =
      populatedAuthor._id?.toString() ?? post.postedBy.toString();

    return {
      ...postData,
      likesCount: post.likedBy.length,
      commentsCount: commentCountByPost.get(post._id.toString()) ?? 0,
      isLikedByCurrentUser: post.likedBy.some(
        (likedBy) => likedBy.toString() === userId,
      ),
      isOwnedByCurrentUser: postedById === userId,
    };
  });

  res.status(StatusCodes.OK).json({
    posts: feedPosts,
    page,
    limit,
    totalPosts,
    hasMore: skip + posts.length < totalPosts,
  });
});

export { getFeed };
