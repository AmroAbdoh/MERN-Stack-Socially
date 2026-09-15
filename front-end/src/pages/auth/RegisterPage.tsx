import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layout/AuthLayout/AuthLayout";
import AuthInput from "../../components/InputField/InputField";
import PrimaryButton from "../../components/auth/Button";
import PasswordRequirements from "../../components/PasswordRequirements/PasswordRequirements";
import { registerUser } from "../../services/auth";

import "./AuthPage.css";

const SECURITY_QUESTIONS = [
  "Where were you born?",
  "Where did you study?",
  "What was the name of your first school?",
  "What is the name of your favorite childhood place?",
  "What was your childhood nickname?",
] as const;

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      setStep(2);
      setErrorMessage("");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await registerUser(formData);

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
      title="Find your people."
      description="Create your space, join the conversation, and keep the people who matter close."
    >
      <div className="auth-header">
        <h2>Create account</h2>
        <p>
          {step === 1
            ? "Start with the details that make your account yours."
            : "Choose a question to help keep your account secure."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {step === 1 ? (
          <>
            <AuthInput
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <AuthInput
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <PasswordRequirements password={formData.password} />

            <PrimaryButton type="submit" label="Continue" />
          </>
        ) : (
          <>
            <div className="auth-field">
              <label htmlFor="securityQuestion">Security question</label>
              <select
                id="securityQuestion"
                name="securityQuestion"
                value={formData.securityQuestion}
                onChange={handleChange}
                required
              >
                {SECURITY_QUESTIONS.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            <AuthInput
              label="Security answer"
              type="text"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
              required
            />

            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              label={isSubmitting ? "Creating..." : "Create account"}
            />

            <button
              type="button"
              className="auth-back-button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back to account details
            </button>
          </>
        )}

        <p className="auth-footer">
          Already have an account?
          <button
            type="button"
            className="switch-link"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
