import { useNavigate } from "react-router-dom";

import type { ProfileConnection } from "../../services/profile";
import { getAssetUrl } from "../../services/profile";

import "./userList.css";

type UserListProps = {
  users: ProfileConnection[];
  onSelect?: () => void;
};

function UserList({ users, onSelect }: UserListProps) {
  const navigate = useNavigate();

  return (
    <div className="user-list">
      {users.map((user) => (
        <button
          type="button"
          className="user-list__item"
          key={user.id}
          onClick={() => {
            onSelect?.();
            navigate(`/profile/${encodeURIComponent(user.username)}`);
          }}
        >
          <span className="user-list__avatar">
            {user.avatar ? (
              <img
                src={`${getAssetUrl(user.avatar)}?v=${encodeURIComponent(user.avatar)}`}
                alt=""
              />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            )}
          </span>
          <span className="user-list__details">
            <strong>{user.name}</strong>
            <span>@{user.username}</span>
          </span>
          <span className="user-list__arrow" aria-hidden="true">
            &gt;
          </span>
        </button>
      ))}
    </div>
  );
}

export default UserList;
