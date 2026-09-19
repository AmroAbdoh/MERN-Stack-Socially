import ModalLayout from "../../layout/ModalLayout/ModalLayout";
import type { ProfileConnection } from "../../services/profile";
import UserList from "../UserList/UserList";

import "./likesModal.css";

type LikesModalProps = {
  likes: ProfileConnection[];
  onClose: () => void;
};

function LikesModal({ likes, onClose }: LikesModalProps) {
  return (
    <ModalLayout
      eyebrow="Post activity"
      title="Likes"
      titleId="post-likes-title"
      onClose={onClose}
      showCloseButton={false}
    >
      {likes.length === 0 ? (
        <p className="likes-modal__empty">No likes yet.</p>
      ) : (
        <UserList users={likes} onSelect={onClose} />
      )}
    </ModalLayout>
  );
}

export default LikesModal;
