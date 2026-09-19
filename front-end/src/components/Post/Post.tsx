import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createComment,
  getAssetUrl,
  getPostById,
  getPostComments,
  likePost,
  unlikePost,
  type PostComment,
  type ProfileConnection,
  type ProfilePost,
} from "../../services/profile";
import LikesModal from "../LikesModal/LikesModal";

import "./post.css";

type PostProps = {
  post: ProfilePost;
  fallbackAuthor?: ProfileConnection;
  currentUserId?: string;
  isDetail?: boolean;
  onLikesClick?: () => void;
};

function Post({
  post,
  fallbackAuthor,
  currentUserId,
  isDetail = false,
  onLikesClick,
}: PostProps) {
  const navigate = useNavigate();
  const likeIds =
    post.likedBy?.map((like) => (typeof like === "string" ? like : like.id)) ||
    [];
  const author =
    post.postedBy && typeof post.postedBy !== "string"
      ? post.postedBy
      : fallbackAuthor;
  const [likesCount, setLikesCount] = useState(post.likedBy?.length || 0);
  const [isLiked, setIsLiked] = useState(
    Boolean(currentUserId && likeIds.includes(currentUserId)),
  );
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likedUsers, setLikedUsers] = useState<ProfileConnection[]>([]);

  const toggleLike = async () => {
    try {
      const response = isLiked
        ? await unlikePost(post._id)
        : await likePost(post._id);
      setLikesCount(response.likesCount);
      setIsLiked(!isLiked);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update like.",
      );
    }
  };

  const toggleComments = async () => {
    const shouldOpen = !isCommentsOpen;
    setIsCommentsOpen(shouldOpen);
    if (!shouldOpen || comments.length > 0) return;

    setIsLoadingComments(true);
    setErrorMessage("");
    try {
      const response = await getPostComments(post._id);
      setComments(response.comments);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load comments.",
      );
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    setErrorMessage("");
    try {
      const response = await createComment(post._id, commentText);
      setComments((currentComments) => [
        response.comment,
        ...currentComments,
      ]);
      setCommentText("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add comment.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openLikes = async () => {
    if (onLikesClick) {
      onLikesClick();
      return;
    }

    try {
      const response = await getPostById(post._id);
      setLikedUsers(
        response.post.likedBy.filter(
          (like): like is ProfileConnection => typeof like !== "string",
        ),
      );
      setIsLikesModalOpen(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load likes.",
      );
    }
  };

  return (
    <article
      className={`post-card${isDetail ? " post-card--detail" : ""}`}
      onClick={() => {
        if (!isDetail) navigate(`/post/${encodeURIComponent(post._id)}`);
      }}
    >
      <header className="post-card__header">
        <div className="post-card__avatar">
          {author?.avatar ? (
            <img src={getAssetUrl(author.avatar)} alt="" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
            </svg>
          )}
        </div>
        <div className="post-card__author">
          <strong>{author?.name || "User"}</strong>
          <span>@{author?.username || "user"}</span>
        </div>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
        {post.visibility === "private" && (
          <span
            className="post-card__private"
            title="Private post"
            aria-label="Private post"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 9h-1V7a4 4 0 00-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V7zm6 12H8v-6h8v6z" />
            </svg>
          </span>
        )}
      </header>

      {post.description && (
        <p className="post-card__description">{post.description}</p>
      )}

      {post.photos.length > 0 && (
        <div
          className={`post-card__gallery post-card__gallery--${Math.min(post.photos.length, 4)}`}
        >
          {post.photos.map((photo) => (
            <img key={photo} src={getAssetUrl(photo)} alt="" />
          ))}
        </div>
      )}

      <div className="post-card__footer">
        <span className="post-card__like-control">
          <button
            type="button"
            className={`post-card__action${isLiked ? " is-liked" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              toggleLike();
            }}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <span aria-hidden="true">♥</span>
          </button>
          {likesCount > 0 && (
            <button
              type="button"
              className="post-card__action post-card__likes-count"
              onClick={(event) => {
                event.stopPropagation();
                openLikes();
              }}
            >
              {likesCount}
            </button>
          )}
        </span>
        <button
          type="button"
          className="post-card__action"
          onClick={(event) => {
            event.stopPropagation();
            toggleComments();
          }}
        >
          <span aria-hidden="true">◌</span>{" "}
          {isCommentsOpen ? "Hide comments" : "Comments"}
        </button>
      </div>

      {errorMessage && <p className="post-card__error">{errorMessage}</p>}

      {isCommentsOpen && (
        <section
          className="post-card__comments"
          aria-label="Comments"
          onClick={(event) => event.stopPropagation()}
        >
          {isLoadingComments ? (
            <p className="post-card__muted">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="post-card__muted">No comments yet.</p>
          ) : (
            comments.map((comment) => {
              const commentAuthor =
                comment.postedBy && typeof comment.postedBy !== "string"
                  ? comment.postedBy
                  : fallbackAuthor;
              return (
                <div className="post-card__comment" key={comment._id}>
                  <button
                    type="button"
                    className="post-card__comment-avatar"
                    onClick={() =>
                      commentAuthor?.username &&
                      navigate(`/profile/${encodeURIComponent(commentAuthor.username)}`)
                    }
                    aria-label={`Open ${commentAuthor?.name || "user"}'s profile`}
                  >
                    {commentAuthor?.avatar ? (
                      <img src={getAssetUrl(commentAuthor.avatar)} alt="" />
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <strong>{commentAuthor?.name || "User"}</strong>
                    <p>{comment.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <form className="post-card__comment-form" onSubmit={submitComment}>
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
            >
              {isSubmittingComment ? "..." : "Send"}
            </button>
          </form>
        </section>
      )}
      {isLikesModalOpen && (
        <LikesModal
          likes={likedUsers}
          onClose={() => setIsLikesModalOpen(false)}
        />
      )}
    </article>
  );
}

export default Post;
