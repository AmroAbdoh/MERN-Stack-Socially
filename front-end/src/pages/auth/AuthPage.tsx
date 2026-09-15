import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../layout/AuthLayout/AuthLayout";
import AuthInput from "../../components/InputField/InputField";
import PrimaryButton from "../../components/auth/Button";
import { loginUser, registerUser } from "../../services/auth";

import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    securityQuestion: "Where were you born?",
    securityAnswer: "",
  });

  const isLogin = location.pathname !== "/register";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setIsSubmitting(true);

      const response = isLogin
        ? await loginUser({
            email: formData.email,
            password: formData.password,
          })
        : await registerUser({
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            securityQuestion: formData.securityQuestion,
            securityAnswer: formData.securityAnswer,
          });

      localStorage.setItem("token", response.token);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userRole", response.user.role || "user");

      navigate("/");
    } catch (error: any) {
      setErrorMessage(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    navigate(isLogin ? "/register" : "/login");
    setErrorMessage("");

    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      securityQuestion: "Where were you born?",
      securityAnswer: "",
    });
  };

  return (
    <AuthLayout
      title="Connect. Share. Discover."
      description="Share your thoughts, connect with people, and discover new conversations."
    >
      <div className="auth-header">
        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>

        <p>
          {isLogin
            ? "Sign in to continue to your account."
            : "Create your account and join the conversation."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <>
            <AuthInput
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <AuthInput
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <AuthInput
              label="Security question"
              type="text"
              name="securityQuestion"
              value={formData.securityQuestion}
              onChange={handleChange}
            />
            <AuthInput
              label="Security answer"
              type="text"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
            />
          </>
        )}

        <AuthInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        {isLogin && (
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
        )}

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          label={
            isSubmitting
              ? isLogin
                ? "Logging in..."
                : "Creating..."
              : isLogin
                ? "Login"
                : "Register"
          }
        />

        <p className="auth-footer">
          {isLogin ? "New here? " : "Already have an account? "}

          <button type="button" className="switch-link" onClick={switchMode}>
            {isLogin ? "Create an account" : "Login"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default AuthPage;
