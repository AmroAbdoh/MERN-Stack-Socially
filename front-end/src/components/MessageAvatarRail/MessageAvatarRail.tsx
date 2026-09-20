import { useNavigate } from "react-router-dom";

import type { MessageUser } from "../../services/messaging";
import { getAssetUrl } from "../../services/profile";

import "./messageAvatarRail.css";

type MessageAvatarRailProps = {
  users: MessageUser[];
  isLoading: boolean;
};

function MessageAvatarRail({ users, isLoading }: MessageAvatarRailProps) {
  const navigate = useNavigate();
  const recentUsers = users.slice(0, 3);

  return (
    <aside className="message-avatar-rail" aria-label="Recent conversations">
      {/* <div className="message-avatar-rail__heading">
        <span>Chats</span>
        <button
          type="button"
          onClick={() => navigate("/messages")}
          aria-label="Open all messages"
        >
          &gt;
        </button>
      </div> */}
      {isLoading ? (
        <p className="message-avatar-rail__status">...</p>
      ) : recentUsers.length === 0 ? (
        <p className="message-avatar-rail__status">No chats yet.</p>
      ) : (
        <div className="message-avatar-rail__users">
          {recentUsers.map((user) => (
            <button
              type="button"
              className="message-avatar-rail__user"
              key={user.id}
              onClick={() =>
                navigate(`/messages?user=${encodeURIComponent(user.id)}`)
              }
              aria-label={`Message ${user.name}`}
              title={user.name}
            >
              <span className="message-avatar-rail__avatar">
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
                {user.unreadCount ? (
                  <span className="message-avatar-rail__unread">
                    {user.unreadCount > 99 ? "99+" : user.unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default MessageAvatarRail;
