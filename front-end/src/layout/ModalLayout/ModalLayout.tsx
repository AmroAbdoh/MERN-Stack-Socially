import { useEffect, type ReactNode } from "react";

import "./modalLayout.css";

type ModalLayoutProps = {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  titleId?: string;
  onClose: () => void;
  closeLabel?: string;
  showCloseButton?: boolean;
};

function ModalLayout({
  children,
  title,
  eyebrow,
  titleId = "modal-title",
  onClose,
  closeLabel = "Close dialog",
  showCloseButton = true,
}: ModalLayoutProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="modal-layout-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="modal-layout"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-layout__heading">
          <div>
            {eyebrow && <p className="modal-layout__eyebrow">{eyebrow}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          {showCloseButton && (
            <button
              type="button"
              className="modal-layout__close"
              onClick={onClose}
              aria-label={closeLabel}
            >
              x
            </button>
          )}
        </div>
        <div className="modal-layout__content">{children}</div>
      </section>
    </div>
  );
}

export default ModalLayout;
