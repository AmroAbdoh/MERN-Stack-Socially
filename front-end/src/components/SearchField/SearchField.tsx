import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSearchUsers, type SearchUser } from "../../services/search";
import { getAssetUrl } from "../../services/profile";

import "./search.css";

function SearchField() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    let isCurrentRequest = true;
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      void getSearchUsers(query)
        .then((response) => {
          if (isCurrentRequest) setUsers(response.users.slice(0, 6));
        })
        .catch(() => {
          if (isCurrentRequest) setUsers([]);
        })
        .finally(() => {
          if (isCurrentRequest) setIsLoading(false);
        });
    }, 400);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
    setIsFocused(false);
  };

  return (
    <form className="navbar__search-wrap" onSubmit={submitSearch}>
      <svg
        viewBox="0 0 24 24"
        className="navbar__search-icon"
        aria-hidden="true"
      >
        <path d="M10.5 3a7.5 7.5 0 015.94 12.44l4.36 4.36 1.41-1.41-4.36-4.36A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 104.12 9.42A5.5 5.5 0 0010.5 5z" />
      </svg>
      <input
        type="search"
        name="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onFocus={() => {
          if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
          setIsFocused(true);
        }}
        onBlur={() => {
          blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 150);
        }}
        placeholder="Search"
        className="navbar__search-input"
        aria-label="Search users and posts"
      />

      {isFocused && searchTerm.trim() && (
        <div className="navbar__search-dropdown">
          {isLoading ? (
            <p className="navbar__search-status">Searching users...</p>
          ) : users.length > 0 ? (
            <>
              <p className="navbar__search-label">Users</p>
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  className="navbar__search-result"
                  onClick={() => {
                    navigate(`/profile/${encodeURIComponent(user.username)}`);
                    setIsFocused(false);
                  }}
                >
                  <span className="navbar__search-avatar">
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
                  </span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>@{user.username}</small>
                  </span>
                  <span aria-hidden="true">&gt;</span>
                </button>
              ))}
              <button
                type="submit"
                className="navbar__search-all"
                onMouseDown={(event) => event.preventDefault()}
              >
                View all results
              </button>
            </>
          ) : (
            <>
              <p className="navbar__search-status">No matching users.</p>
              <button
                type="submit"
                className="navbar__search-all"
                onMouseDown={(event) => event.preventDefault()}
              >
                Search posts too
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}

export default SearchField;
