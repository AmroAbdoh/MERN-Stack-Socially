import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Feed from "../../components/Feed/Feed";
import UserList from "../../components/UserList/UserList";
import {
  getSearchPosts,
  getSearchUsers,
  type SearchUser,
} from "../../services/search";
import type { ProfileConnection, ProfilePost } from "../../services/profile";

import "./searchPage.css";

type SearchFilter = "all" | "users" | "posts";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query")?.trim() || "";
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;
    setUsers([]);
    setPosts([]);
    setErrorMessage("");

    if (!query) return () => undefined;

    setIsLoading(true);
    const userRequest =
      filter === "posts"
        ? Promise.resolve({ users: [] })
        : getSearchUsers(query);
    const postRequest =
      filter === "users"
        ? Promise.resolve({ posts: [] })
        : getSearchPosts(query);

    void Promise.all([userRequest, postRequest])
      .then(([userResponse, postResponse]) => {
        if (!isCurrentRequest) return;
        setUsers(userResponse.users);
        setPosts(postResponse.posts);
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load search results.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [filter, query]);

  const userConnections: ProfileConnection[] = users.map((user) => ({
    id: user._id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
  }));

  return (
    <main className="search-page">
      <header className="search-page__header">
        <p className="search-page__eyebrow">Search</p>
        <h1>Results for “{query}”</h1>
        <div className="search-page__filters" aria-label="Search result type">
          {(["all", "users", "posts"] as SearchFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? "is-active" : ""}
              onClick={() => setFilter(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {isLoading && <p className="search-page__message">Loading results...</p>}
      {errorMessage && (
        <p className="search-page__message error">{errorMessage}</p>
      )}
      {!isLoading && !errorMessage && (
        <div className="search-page__results">
          {(filter === "all" || filter === "users") && (
            <section className="search-page__section">
              <div className="search-page__section-heading">
                <h2>Users</h2>
                <span>{userConnections.length}</span>
              </div>
              {userConnections.length > 0 ? (
                <UserList users={userConnections} />
              ) : (
                <p className="search-page__empty">No matching users.</p>
              )}
            </section>
          )}

          {(filter === "all" || filter === "posts") && (
            <section className="search-page__section">
              <div className="search-page__section-heading">
                <h2>Posts</h2>
                <span>{posts.length}</span>
              </div>
              <Feed posts={posts} emptyMessage="No matching posts." />
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default SearchPage;
