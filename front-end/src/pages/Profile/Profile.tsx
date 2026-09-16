import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import PrimaryButton from "../../components/Button/Button";
import {
  getCurrentProfile,
  getMyPosts,
  type ProfilePost,
  type ProfileUser,
} from "../../services/profile";
import "./profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, postsResponse] = await Promise.all([
          getCurrentProfile(),
          getMyPosts(),
        ]);
        setUser(profileResponse.user);
        setPosts(postsResponse.posts);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Navbar />
      <main className="profile-container">
        {isLoading && <p className="profile-message">Loading profile...</p>}
        {!isLoading && errorMessage && (
          <p className="profile-message error">{errorMessage}</p>
        )}
        {!isLoading && user && (
          <div className="profile-wrapper">
            <section className="profile-header">
              <div className="profile-avatar">
                {user.avatar ? (
                  <img
                    src={`${API_URL.replace("/api", "")}${user.avatar}`}
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
                <p className="profile-email">{user.email}</p>
                <p className="profile-bio">{user.bio || "No bio yet."}</p>
                <div className="profile-stats">
                  <span className="profile-stat">
                    <strong>{user.following.length}</strong>Following
                  </span>
                  <span className="profile-stat">
                    <strong>{user.followers.length}</strong>Followers
                  </span>
                  <span className="profile-stat">
                    <strong>{posts.length}</strong>Posts
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                <PrimaryButton
                  label="Edit Profile"
                  type="button"
                  variant="primary"
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
            </section>

            <section className="profile-posts">
              <div className="profile-posts-header">
                <h2>Posts</h2>
                <span>
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
              </div>
              {posts.length === 0 ? (
                <p className="profile-message">
                  You have not shared anything yet.
                </p>
              ) : (
                <div className="profile-post-grid">
                  {posts.map((post) => (
                    <article className="profile-post" key={post._id}>
                      {post.photos[0] && (
                        <img
                          className="profile-post-photo"
                          src={post.photos[0]}
                          alt=""
                        />
                      )}
                      {post.description && <p>{post.description}</p>}
                      <div className="profile-post-meta">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="profile-post-visibility">
                          {post.visibility}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default Profile;
