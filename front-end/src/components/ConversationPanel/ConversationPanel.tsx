import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAssetUrl } from "../../services/profile";
import type { MessageItem, MessageUser } from "../../services/messaging";

import "./conversationPanel.css";

type ConversationPanelProps = {
  currentUserId: string;
  selectedUser: MessageUser | null;
  messages: MessageItem[];
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string;
  onSend: (text: string) => Promise<void>;
};

function ConversationPanel({
  currentUserId,
  selectedUser,
  messages,
  isLoading,
  isSending,
  errorMessage,
  onSend,
}: ConversationPanelProps) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || isSending) return;
    await onSend(text);
    setText("");
  };

  if (!selectedUser) {
    return (
      <section className="conversation-panel conversation-panel--empty">
        <div>
          <span className="conversation-panel__empty-icon" aria-hidden="true">
            〰
          </span>
          <h2>Your conversations</h2>
          <p>Select someone from the list to start messaging.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="conversation-panel"
      aria-label={`Conversation with ${selectedUser.name}`}
    >
      <header className="conversation-panel__header">
        <button
          type="button"
          className="conversation-panel__user"
          onClick={() =>
            navigate(`/profile/${encodeURIComponent(selectedUser.username)}`)
          }
          aria-label={`Open ${selectedUser.name}'s profile`}
        >
          <span className="conversation-panel__avatar">
            {selectedUser.avatar ? (
              <img src={getAssetUrl(selectedUser.avatar)} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
              </svg>
            )}
          </span>
          <span>
            <h2>{selectedUser.name}</h2>
            <p>@{selectedUser.username}</p>
          </span>
        </button>
      </header>

      <div className="conversation-panel__messages">
        {isLoading ? (
          <p className="conversation-panel__status">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="conversation-panel__status">
            No messages yet. Say hello to {selectedUser.name}.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender.id === currentUserId;
            return (
              <div
                className={`conversation-panel__message-row${isMine ? " is-mine" : ""}`}
                key={message._id}
              >
                <div className="conversation-panel__bubble">
                  <p>{message.text}</p>
                  <time dateTime={message.createdAt}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {errorMessage && (
        <p className="conversation-panel__error">{errorMessage}</p>
      )}
      <form className="conversation-panel__composer" onSubmit={submitMessage}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Message ${selectedUser.name}`}
          aria-label={`Message ${selectedUser.name}`}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          aria-label="Send message"
        >
          {isSending ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default ConversationPanel;
