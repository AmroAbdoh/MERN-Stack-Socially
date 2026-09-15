import { useState } from "react";

import "./inputField.css";

type InputProps = {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  showPasswordToggle?: boolean;
};

function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  showPasswordToggle = false,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <div className="auth-input-wrap">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
        />
        {showPasswordToggle && isPassword && (
          <button
            type="button"
            className="password-toggle"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;
