import { getAssetUrl } from "../../services/profile";
import type { MessageUser } from "../../services/messaging";

import "./conversationList.css";

type ConversationListProps = {
  users: MessageUser[];
  selectedUserId?: string;
  isLoading: boolean;
  onSelect: (user: MessageUser) => void;
};

function ConversationList({
  users,
  selectedUserId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  return (
    <aside className="conversation-list" aria-label="Conversations">
      <div className="conversation-list__header">
        <div>
          <p className="conversation-list__eyebrow">Inbox</p>
          <h1>Messages</h1>
        </div>
        <span className="conversation-list__count">{users.length}</span>
      </div>

      {isLoading ? (
        <p className="conversation-list__message">Loading conversations...</p>
      ) : users.length === 0 ? (
        <p className="conversation-list__message">
          Follow someone or start a conversation to see them here.
        </p>
      ) : (
        <div className="conversation-list__items">
          {users.map((user) => (
            <button
              type="button"
              key={user.id}
              className={`conversation-list__item${selectedUserId === user.id ? " is-active" : ""}`}
              onClick={() => onSelect(user)}
            >
              <span className="conversation-list__avatar">
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
              <span className="conversation-list__details">
                <strong>{user.name}</strong>
                <span>@{user.username}</span>
              </span>
              <span className="conversation-list__meta">
                {user.unreadCount ? (
                  <span
                    className="conversation-list__unread"
                    aria-label={`${user.unreadCount} unread messages`}
                  >
                    {user.unreadCount > 99 ? "99+" : user.unreadCount}
                  </span>
                ) : (
                  <span className="conversation-list__arrow" aria-hidden="true">
                    &gt;
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default ConversationList;
