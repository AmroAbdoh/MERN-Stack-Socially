import "./button.css";

type LinkProps = {
  label: string;
  link?: string;
};

function LinkButton({ label, link }: LinkProps) {
  return (
    <a href={link} className="primary-btn link">
      {label}
    </a>
  );
}

export default LinkButton;