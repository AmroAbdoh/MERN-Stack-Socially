import { useEffect, useState } from "react";

import PrimaryButton from "../../components/Button/Button";
import ModalLayout from "../../layout/ModalLayout/ModalLayout";
import { createPost, type ProfilePost } from "../../services/profile";

import "./createPost.css";

type CreatePostProps = {
  onClose: () => void;
  onCreated: (post: ProfilePost) => void;
};

function CreatePost({ onClose, onCreated }: CreatePostProps) {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const previews = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);

    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [images]);

  const selectImages = (files: FileList | null) => {
    if (!files) return;

    const selectedImages = Array.from(files);
    if (selectedImages.some((image) => !image.type.startsWith("image/"))) {
      setErrorMessage("Only image files are allowed.");
      return;
    }

    if (selectedImages.some((image) => image.size > 5 * 1024 * 1024)) {
      setErrorMessage("Each image must be 5 MB or smaller.");
      return;
    }

    if (images.length + selectedImages.length > 6) {
      setErrorMessage("You can add up to 6 images.");
      return;
    }

    setErrorMessage("");
    setImages((currentImages) => [...currentImages, ...selectedImages]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!description.trim() && images.length === 0) {
        setErrorMessage("Add some text or at least one image.");
        setIsSubmitting(false);
        return;
      }

      const response = await createPost({ description, visibility, images });
      onCreated(response.post);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout
      eyebrow="Share something"
      title="Create post"
      titleId="create-post-title"
      onClose={onClose}
      showCloseButton={false}
    >
      <form className="create-post-form" onSubmit={handleSubmit}>
        <label>
          What is on your mind?
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Share an update with your people..."
            maxLength={5000}
            rows={6}
            required
          />
        </label>

        <div className="create-post-image-field">
          <span>Add images</span>
          <input
            id="post-images"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            onChange={(event) => {
              selectImages(event.target.files);
              event.target.value = "";
            }}
          />
          <label className="create-post-file-label" htmlFor="post-images">
            Choose images
          </label>
          {images.length > 0 && (
            <div className="create-post-image-grid">
              {images.map((image, index) => (
                <div
                  className="create-post-image-preview"
                  key={`${image.name}-${index}`}
                >
                  <img src={imagePreviews[index]} alt="" />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((currentImages) =>
                        currentImages.filter(
                          (_, imageIndex) => imageIndex !== index,
                        ),
                      )
                    }
                    aria-label={`Remove ${image.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <div className="create-post-actions">
          <PrimaryButton
            type="button"
            variant="secondary"
            label="Cancel"
            onClick={onClose}
          />
          <PrimaryButton
            type="submit"
            label={isSubmitting ? "Publishing..." : "Publish post"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </ModalLayout>
  );
}

export default CreatePost;
