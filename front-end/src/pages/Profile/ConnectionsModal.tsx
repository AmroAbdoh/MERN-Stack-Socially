import { useNavigate } from "react-router-dom";

import ModalLayout from "../../layout/ModalLayout/ModalLayout";
import type { ProfileConnection } from "../../services/profile";
import { getAssetUrl } from "../../services/profile";

import "./connectionsModal.css";

type ConnectionType = "followers" | "following";

type ConnectionsModalProps = {
  username: string;
  connectionType: ConnectionType;
  users: ProfileConnection[];
  isLoading: boolean;
  errorMessage: string;
  onClose: () => void;
};

function ConnectionsModal({
  username,
  connectionType,
  users,
  isLoading,
  errorMessage,
  onClose,
}: ConnectionsModalProps) {
  const navigate = useNavigate();
  const title = connectionType === "followers" ? "Followers" : "Following";

  return (
    <ModalLayout
      title={title}
      eyebrow={`@${username}`}
      titleId={`${connectionType}-title`}
      onClose={onClose}
      showCloseButton={false}
    >
      {isLoading ? (
        <p className="connections-modal__empty">
          Loading {title.toLowerCase()}...
        </p>
      ) : errorMessage ? (
        <p className="connections-modal__empty connections-modal__empty--error">
          {errorMessage}
        </p>
      ) : users.length === 0 ? (
        <p className="connections-modal__empty">
          {connectionType === "followers"
            ? "No followers yet."
            : "Not following anyone yet."}
        </p>
      ) : (
        <div className="connections-modal__list">
          {users.map((connection) => (
            <button
              type="button"
              className="connections-modal__person"
              key={connection.id}
              onClick={() => {
                onClose();
                navigate(`/profile/${encodeURIComponent(connection.username)}`);
              }}
            >
              <span className="connections-modal__avatar">
                {connection.avatar ? (
                  <img
                    src={`${getAssetUrl(connection.avatar)}?v=${encodeURIComponent(connection.avatar)}`}
                    alt=""
                  />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                  </svg>
                )}
              </span>
              <span className="connections-modal__details">
                <strong>{connection.name}</strong>
                <span>@{connection.username}</span>
              </span>
              <span className="connections-modal__arrow" aria-hidden="true">
                &gt;
              </span>
            </button>
          ))}
        </div>
      )}
    </ModalLayout>
  );
}

export default ConnectionsModal;
