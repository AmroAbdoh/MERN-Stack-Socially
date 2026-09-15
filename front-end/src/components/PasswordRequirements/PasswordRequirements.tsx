import "./passwordRequirements.css";

type PasswordRequirementsProps = {
  password: string;
};

type PasswordRule = {
  label: string;
  isValid: (password: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "Password must contain at least 8 characters",
    isValid: (password) => password.length >= 8,
  },
  {
    label: "Password must contain an uppercase letter",
    isValid: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Password must contain a lowercase letter",
    isValid: (password) => /[a-z]/.test(password),
  },
  {
    label: "Password must contain a number",
    isValid: (password) => /\d/.test(password),
  },
  {
    label: "Password must contain a special character",
    isValid: (password) => /[@$!%*?&._\-#^()~]/.test(password),
  },
];

export const isStrongPassword = (password: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.isValid(password));

function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const remainingRules = PASSWORD_RULES.filter(
    (rule) => !rule.isValid(password),
  );

  if (remainingRules.length === 0) return null;

  return (
    <ul className="password-requirements" aria-live="polite">
      {remainingRules.map((rule) => (
        <li key={rule.label}>{rule.label}</li>
      ))}
    </ul>
  );
}

export default PasswordRequirements;
