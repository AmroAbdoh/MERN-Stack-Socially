import { useNavigate } from "react-router-dom";

import {
  followUser,
  getAssetUrl,
  type ProfileConnection,
} from "../../services/profile";

import "./followSuggestions.css";

type FollowSuggestionsProps = {
  users: ProfileConnection[];
  onFollowed: (userId: string) => void;
};

function FollowSuggestions({ users, onFollowed }: FollowSuggestionsProps) {
  const navigate = useNavigate();

  if (users.length === 0) return null;

  return (
    <aside className="follow-suggestions" aria-label="People you may know">
      <div className="follow-suggestions__heading">
        <span>Suggested for you</span>
      </div>
      <div className="follow-suggestions__list">
        {users.map((user) => (
          <div className="follow-suggestions__item" key={user.id}>
            <button
              type="button"
              className="follow-suggestions__identity"
              onClick={() =>
                navigate(`/profile/${encodeURIComponent(user.username)}`)
              }
            >
              <span className="follow-suggestions__avatar">
                {user.avatar ? (
                  <img src={getAssetUrl(user.avatar)} alt="" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                  </svg>
                )}
              </span>
              <span className="follow-suggestions__details">
                <strong>{user.name}</strong>
                <small>@{user.username}</small>
              </span>
            </button>
            <button
              type="button"
              className="follow-suggestions__button"
              onClick={() => {
                void followUser(user.username).then(() => onFollowed(user.id));
              }}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default FollowSuggestions;
