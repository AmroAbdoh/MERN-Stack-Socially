import ModalLayout from "../../layout/ModalLayout/ModalLayout";
import type { ProfileConnection } from "../../services/profile";
import UserList from "../../components/UserList/UserList";

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
        <UserList users={users} onSelect={onClose} />
      )}
    </ModalLayout>
  );
}

export default ConnectionsModal;
