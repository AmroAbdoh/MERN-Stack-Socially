import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PrimaryButton from "../../components/Button/Button";
import Post from "../../components/Post/Post";
import ModalLayout from "../../layout/ModalLayout/ModalLayout";
import {
  getCurrentProfile,
  getPostById,
  updatePost,
  type ProfilePost,
  type ProfileUser,
} from "../../services/profile";

import "./postPage.css";

type EditPostProps = {
  post: ProfilePost;
  onClose: () => void;
  onSaved: (post: ProfilePost) => void;
};

function EditPost({ post, onClose, onSaved }: EditPostProps) {
  const [description, setDescription] = useState(post.description);
  const [visibility, setVisibility] = useState(post.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await updatePost(post._id, { description, visibility });
      onSaved(response.post);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update post.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalLayout
      eyebrow="Your post"
      title="Edit post"
      titleId="edit-post-title"
      onClose={onClose}
      showCloseButton={false}
    >
      <form className="post-page__edit-form" onSubmit={handleSubmit}>
        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={5000}
            rows={6}
          />
        </label>
        <label>
          Visibility
          <select
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as "public" | "private")
            }
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        {errorMessage && <p className="post-page__error">{errorMessage}</p>}
        <div className="post-page__edit-actions">
          <PrimaryButton
            type="button"
            variant="secondary"
            label="Cancel"
            onClick={onClose}
          />
          <PrimaryButton
            type="submit"
            label={isSaving ? "Saving..." : "Save changes"}
            disabled={isSaving}
          />
        </div>
      </form>
    </ModalLayout>
  );
}

function PostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<ProfilePost | null>(null);
  const [viewer, setViewer] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        setErrorMessage("Post not found.");
        setIsLoading(false);
        return;
      }

      try {
        const [postResponse, viewerResponse] = await Promise.all([
          getPostById(postId),
          getCurrentProfile().catch(() => null),
        ]);
        setPost(postResponse.post);
        setViewer(viewerResponse?.user || null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load post.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const author =
    post?.postedBy && typeof post.postedBy !== "string"
      ? post.postedBy
      : undefined;
  const isOwner = Boolean(viewer && author && viewer.id === author.id);
  return (
    <main className="post-page">
      <div className="post-page__topbar">
        <button
          type="button"
          className="post-page__back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        {isOwner && (
          <PrimaryButton
            type="button"
            label="Edit post"
            onClick={() => setIsEditOpen(true)}
          />
        )}
      </div>
      {isLoading && <p className="post-page__message">Loading post...</p>}
      {!isLoading && errorMessage && (
        <p className="post-page__message post-page__message--error">
          {errorMessage}
        </p>
      )}
      {!isLoading && post && (
        <Post
          post={post}
          fallbackAuthor={author}
          currentUserId={viewer?.id}
          isDetail
        />
      )}
      {isEditOpen && post && (
        <EditPost
          post={post}
          onClose={() => setIsEditOpen(false)}
          onSaved={setPost}
        />
      )}
    </main>
  );
}

export default PostPage;
