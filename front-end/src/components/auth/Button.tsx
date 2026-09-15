import "./button.css";

type ButtonProps = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
  variant?: "primary" | "secondary" | "danger";
};

function PrimaryButton({
  label,
  disabled = false,
  onClick,
  type = "submit",
  variant = "primary",
}: ButtonProps) {
  const buttonClass =
    variant === "secondary"
      ? "secondary-btn"
      : variant === "danger"
        ? "danger-btn"
        : "primary-btn";

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default PrimaryButton;