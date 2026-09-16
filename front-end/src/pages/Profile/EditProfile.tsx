import { useEffect, useState } from "react";

import PrimaryButton from "../../components/Button/Button";
import type { ProfileUser } from "../../services/profile";
import {
  removeAvatar,
  updateAvatar,
  updateProfile,
  getAssetUrl,
} from "../../services/profile";

import "./editProfile.css";

type EditProfileProps = {
  user: ProfileUser;
  onClose: () => void;
  onSaved: (user: ProfileUser) => void;
};

function EditProfile({ user, onClose, onSaved }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(getAssetUrl(user.avatar));
  const [isDragging, setIsDragging] = useState(false);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!avatarFile) return;

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const selectAvatar = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Avatar file must be 5 MB or smaller.");
      return;
    }

    setErrorMessage("");
    setShouldRemoveAvatar(false);
    setAvatarFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      const profileResponse = await updateProfile(formData);
      let savedUser = profileResponse.user;

      if (shouldRemoveAvatar) {
        const avatarResponse = await removeAvatar();
        savedUser = { ...savedUser, avatar: avatarResponse.avatar };
      } else if (avatarFile) {
        const avatarResponse = await updateAvatar(avatarFile);
        savedUser = { ...savedUser, avatar: avatarResponse.avatar };
      }

      localStorage.setItem("userName", savedUser.name);
      localStorage.setItem("userEmail", savedUser.email);
      onSaved(savedUser);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="edit-profile-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="edit-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="edit-profile-heading">
          <div>
            <p className="edit-profile-eyebrow">Your profile</p>
            <h2 id="edit-profile-title">Edit profile</h2>
          </div>
          <button
            type="button"
            className="edit-profile-close"
            onClick={onClose}
            aria-label="Close edit profile"
          >
            x
          </button>
        </div>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div
            className={`edit-profile-avatar-field${isDragging ? " is-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              selectAvatar(event.dataTransfer.files[0]);
            }}
          >
            <span>Profile picture</span>
            <div className="edit-profile-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" />
              ) : (
                <span>No avatar</span>
              )}
            </div>
            <input
              id="profile-avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => selectAvatar(event.target.files?.[0])}
            />
            <label className="edit-profile-file-label" htmlFor="profile-avatar">
              Choose an image or drag it here
            </label>
            {avatarFile && <small>{avatarFile.name}</small>}
            {(avatarPreview || user.avatar) && (
              <button
                type="button"
                className="edit-profile-remove-avatar"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview("");
                  setShouldRemoveAvatar(true);
                }}
              >
                Remove current avatar
              </button>
            )}
          </div>

          <label>
            Name
            <input
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              required
            />
          </label>
          <label>
            Username
            <input
              value={formData.username}
              onChange={(event) =>
                setFormData({ ...formData, username: event.target.value })
              }
              required
            />
          </label>
          <label>
            Bio
            <textarea
              value={formData.bio}
              maxLength={160}
              rows={4}
              onChange={(event) =>
                setFormData({ ...formData, bio: event.target.value })
              }
            />
          </label>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <div className="edit-profile-actions">
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
      </section>
    </div>
  );
}

export default EditProfile;
