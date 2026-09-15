import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layout/AuthLayout/AuthLayout";
import AuthInput from "../../components/InputField/InputField";
import PrimaryButton from "../../components/auth/Button";
import { loginUser } from "../../services/auth";

import "./AuthPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });

      localStorage.setItem("token", response.token);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userRole", response.user.role || "user");
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Connect. Share. Discover."
      description="Share your thoughts, connect with people, and discover new conversations."
    >
      <div className="auth-header">
        <h2>Welcome back</h2>
        <p>Sign in to continue to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <AuthInput
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          showPasswordToggle
        />

        <div className="auth-row">
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="forgot-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? "Logging in..." : "Login"}
        />

        <p className="auth-footer">
          New here?
          <button
            type="button"
            className="switch-link"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
