import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createComment,
  getAssetUrl,
  getPostComments,
  likePost,
  unlikePost,
  updateComment,
  deleteComment,
  deletePost,
  type PostComment,
  type ProfileConnection,
  type ProfilePost,
} from "../../services/profile";
import "./post.css";

type PostProps = {
  post: ProfilePost;
  fallbackAuthor?: ProfileConnection;
  currentUserId?: string;
  isDetail?: boolean;
  onDeleted?: () => void;
};

function Post({
  post,
  fallbackAuthor,
  currentUserId,
  isDetail = false,
  onDeleted,
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const isPostOwner = Boolean(currentUserId && author?.id === currentUserId);

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
      setComments((currentComments) => [response.comment, ...currentComments]);
      setCommentText("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add comment.",
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${encodeURIComponent(post._id)}`,
      );
      setErrorMessage("Post link copied.");
    } catch {
      setErrorMessage("Unable to copy the post link.");
    }
  };

  const removePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(post._id);
      onDeleted?.();
      if (isDetail) navigate(-1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete post.",
      );
    }
  };

  const saveComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const response = await updateComment(commentId, editingCommentText);
      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId ? response.comment : comment,
        ),
      );
      setEditingCommentId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update comment.",
      );
    }
  };

  const removeComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete comment.",
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
        <div className="post-card__meta">
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
          <div className="post-card__meta-actions">
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
            {isPostOwner && (
              <button
                type="button"
                className="post-card__delete-post"
                onClick={(event) => {
                  event.stopPropagation();
                  void removePost();
                }}
                aria-label="Delete post"
                title="Delete post"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-3 6h12l-1 11H7L6 9zm3 2v7h2v-7H9zm4 0v7h2v-7h-2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
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
        <button
          type="button"
          className={`post-card__action post-card__like-button${isLiked ? " is-liked" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            void toggleLike();
          }}
          aria-label={
            isLiked
              ? `Unlike post, ${likesCount} likes`
              : `Like post, ${likesCount} likes`
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7-4.35-9.5-8.5C.2 7.8 2.4 4 6.5 4c2.1 0 3.55 1.2 4.5 2.55C11.95 5.2 13.4 4 15.5 4c4.1 0 6.3 3.8 4 8.5C19 16.65 12 21 12 21z" />
          </svg>
          {/* <span>{isLiked ? "Liked" : "Like"}</span> */}
          <span>{likesCount}</span>
        </button>
        <button
          type="button"
          className={`post-card__action post-card__comment-button${isCommentsOpen ? " is-active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            void toggleComments();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h16v11H8l-4 4V5zm3 4v2h10V9H7zm0 4h7v-2H7v2z" />
          </svg>
          <span>{isCommentsOpen ? "Hide" : "Comments"}</span>
        </button>
        <button
          type="button"
          className="post-card__action post-card__share-button"
          onClick={(event) => {
            event.stopPropagation();
            void sharePost();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 16a3 3 0 00-2.24 1L8.9 13.56a3.1 3.1 0 000-3.12L15.76 6A3 3 0 1015 4.5c0 .2.02.4.06.59L8.1 8.37a3 3 0 100 7.26l6.96 3.28A3 3 0 1018 16z" />
          </svg>
          <span>Share</span>
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
                      navigate(
                        `/profile/${encodeURIComponent(commentAuthor.username)}`,
                      )
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
                  <div className="post-card__comment-body">
                    <div className="post-card__comment-heading">
                      <strong>{commentAuthor?.name || "User"}</strong>
                      {currentUserId === commentAuthor?.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingCommentText(comment.text);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {(currentUserId === commentAuthor?.id || isPostOwner) && (
                        <button
                          type="button"
                          onClick={() => void removeComment(comment._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {editingCommentId === comment._id ? (
                      <form
                        className="post-card__comment-edit"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void saveComment(comment._id);
                        }}
                      >
                        <input
                          value={editingCommentText}
                          onChange={(event) =>
                            setEditingCommentText(event.target.value)
                          }
                          maxLength={1000}
                        />
                        <button type="submit">Save</button>
                      </form>
                    ) : (
                      <p>{comment.text}</p>
                    )}
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
    </article>
  );
}

export default Post;
