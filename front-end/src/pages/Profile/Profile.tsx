import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PrimaryButton from "../../components/Button/Button";
import EditProfile from "./EditProfile";
import ConnectionsModal from "./ConnectionsModal";
import CreatePost from "./CreatePost";
import Feed from "../../components/Feed/Feed";
import CardLayout from "../../layout/CardLayout/CardLayout";
import {
  getCurrentProfile,
  getProfileByUsername,
  getMyPosts,
  getUserPosts,
  getUserConnections,
  followUser,
  unfollowUser,
  type ProfilePost,
  type ProfileConnection,
  type ProfileUser,
} from "../../services/profile";
import "./profile.css";

import { getAssetUrl } from "../../services/profile";

function Profile() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [viewerId, setViewerId] = useState<string | undefined>();
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [connections, setConnections] = useState<ProfileConnection[]>([]);
  const [connectionType, setConnectionType] = useState<
    "followers" | "following" | null
  >(null);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        setErrorMessage("A profile username is required.");
        setIsLoading(false);
        return;
      }

      try {
        const currentProfilePromise = localStorage.getItem("token")
          ? getCurrentProfile().catch(() => null)
          : Promise.resolve(null);
        const [profileResponse, currentProfileResponse] = await Promise.all([
          getProfileByUsername(username),
          currentProfilePromise,
        ]);
        const profileIsOwned =
          currentProfileResponse?.user.id === profileResponse.user.id;
        const postsResponse = profileIsOwned
          ? await getMyPosts()
          : await getUserPosts(profileResponse.user.username);

        setUser(profileResponse.user);
        setPosts(postsResponse.posts);
        setViewerId(currentProfileResponse?.user.id);
        setIsOwner(profileIsOwned);
        setIsFollowing(
          Boolean(
            currentProfileResponse?.user.following.includes(
              profileResponse.user.id,
            ),
          ),
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const openConnections = async (selectedType: "followers" | "following") => {
    if (!username) return;

    setConnectionType(selectedType);
    setConnections([]);
    setConnectionsError("");
    setIsConnectionsLoading(true);

    try {
      const response = await getUserConnections(username, selectedType);
      setConnections(response.users);
    } catch (error) {
      setConnectionsError(
        error instanceof Error ? error.message : "Unable to load this list.",
      );
    } finally {
      setIsConnectionsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  const toggleFollow = async () => {
    if (!username || !user || !viewerId || isFollowLoading) return;

    setIsFollowLoading(true);
    setFollowError("");
    try {
      const response = isFollowing
        ? await unfollowUser(username)
        : await followUser(username);
      setIsFollowing(response.following);
      setUser((currentUser) =>
        currentUser
          ? {
              ...currentUser,
              followers: response.following
                ? [...currentUser.followers, viewerId]
                : currentUser.followers.filter((id) => id !== viewerId),
            }
          : currentUser,
      );
    } catch (error) {
      setFollowError(
        error instanceof Error ? error.message : "Unable to update follow.",
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <main className="profile-container">
      {isLoading && <p className="profile-message">Loading profile...</p>}
      {!isLoading && errorMessage && (
        <p className="profile-message error">{errorMessage}</p>
      )}
      {!isLoading && user && (
        <CardLayout>
          <section className="profile-header">
            <div className="profile-avatar">
              {user.avatar ? (
                <img
                  src={`${getAssetUrl(user.avatar)}?v=${encodeURIComponent(user.avatar)}`}
                  alt={`${user.name}'s avatar`}
                />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                </svg>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-username">@{user.username}</p>
              {isOwner && user.email && (
                <p className="profile-email">{user.email}</p>
              )}
              <p className="profile-bio">{user.bio || "No bio yet."}</p>
              <div className="profile-stats">
                <button
                  type="button"
                  className="profile-stat"
                  onClick={() => openConnections("following")}
                >
                  <strong>{user.following.length}</strong>Following
                </button>
                <button
                  type="button"
                  className="profile-stat"
                  onClick={() => openConnections("followers")}
                >
                  <strong>{user.followers.length}</strong>Followers
                </button>
                <span className="profile-stat">
                  <strong>{posts.length}</strong>Posts
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="profile-actions">
                <PrimaryButton
                  label="Edit Profile"
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditModalOpen(true)}
                />
                <PrimaryButton
                  label="Reset password"
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/auth-reset-password")}
                />
                <PrimaryButton
                  label="Logout"
                  type="button"
                  variant="danger"
                  onClick={handleLogout}
                />
              </div>
            )}
            {!isOwner && viewerId && (
              <div className="profile-actions">
                <PrimaryButton
                  label={
                    isFollowLoading
                      ? "Please wait..."
                      : isFollowing
                        ? "Following"
                        : "Follow"
                  }
                  type="button"
                  variant={isFollowing ? "secondary" : "primary"}
                  disabled={isFollowLoading}
                  onClick={toggleFollow}
                />
                {followError && (
                  <p className="profile-message error">{followError}</p>
                )}
              </div>
            )}
          </section>

          <section className="profile-posts">
            <div className="profile-posts-header">
              <h2>Posts</h2>
              <div className="profile-posts-heading-actions">
                <span>
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
                {isOwner && (
                  <PrimaryButton
                    label="Create post"
                    type="button"
                    onClick={() => setIsCreatePostModalOpen(true)}
                  />
                )}
              </div>
            </div>
            <Feed
              posts={posts}
              fallbackAuthor={user}
              currentUserId={viewerId}
              emptyMessage={
                isOwner
                  ? "You have not shared anything yet."
                  : "No public posts yet."
              }
            />
          </section>
          {isEditModalOpen && (
            <EditProfile
              user={user}
              onClose={() => setIsEditModalOpen(false)}
              onSaved={(savedUser) => {
                setUser(savedUser);
                if (savedUser.username !== username) {
                  navigate(
                    `/profile/${encodeURIComponent(savedUser.username)}`,
                    {
                      replace: true,
                    },
                  );
                }
              }}
            />
          )}
          {isCreatePostModalOpen && (
            <CreatePost
              onClose={() => setIsCreatePostModalOpen(false)}
              onCreated={(post) =>
                setPosts((currentPosts) => [post, ...currentPosts])
              }
            />
          )}
          {connectionType && (
            <ConnectionsModal
              username={user.username}
              connectionType={connectionType}
              users={connections}
              isLoading={isConnectionsLoading}
              errorMessage={connectionsError}
              onClose={() => {
                setConnectionType(null);
                setConnectionsError("");
              }}
            />
          )}
        </CardLayout>
      )}
    </main>
  );
}

export default Profile;
