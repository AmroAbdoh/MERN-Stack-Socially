import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthInput from "../../components/InputField/InputField";
import PrimaryButton from "../../components/Button/Button";
import PasswordRequirements from "../../components/PasswordRequirements/PasswordRequirements";
import { isStrongPassword } from "../../components/PasswordRequirements/PasswordRequirements";
import AuthLayout from "../../layout/AuthLayout/AuthLayout";
import {
  requestPasswordReset,
  resetPassword,
  verifySecurityAnswer,
} from "../../services/auth";

import "./AuthPage.css";

type ResetStep = 2 | 3;

function AuthResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>(2);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("userEmail");

    if (!token || !storedEmail) {
      navigate("/login", { replace: true });
      return;
    }

    setEmail(storedEmail);
    setIsSubmitting(true);

    requestPasswordReset(storedEmail)
      .then((response) => {
        setSecurityQuestion(response.securityQuestion);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your security question.",
        );
      })
      .finally(() => setIsSubmitting(false));
  }, [navigate]);

  const isAnswerValid = securityAnswer.trim().length > 0;
  const isNewPasswordValid = isStrongPassword(newPassword);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (step === 2) {
        const response = await verifySecurityAnswer(email, securityAnswer);
        setResetToken(response.resetToken);
        setStep(3);
        return;
      }

      await resetPassword(resetToken, newPassword);
      navigate("/login");
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
      title="Find your way back."
      description="Reset your password securely and get back to the conversations that matter."
    >
      <div className="auth-header">
        <h2>Reset password</h2>
        <p>
          {step === 2 && "Answer your security question to continue."}
          {step === 3 && "Choose a new password for your account."}
        </p>
      </div>

      <div className="auth-step-indicator" aria-label={`Step ${step} of 3`}>
        <span className={step >= 1 ? "active" : ""}>1</span>
        <i />
        <span className={step >= 2 ? "active" : ""}>2</span>
        <i />
        <span className={step >= 3 ? "active" : ""}>3</span>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {step === 2 && (
          <>
            <div className="auth-security-question">
              <span>Your security question</span>
              <strong>{securityQuestion}</strong>
            </div>
            <AuthInput
              label="Security answer"
              type="text"
              name="securityAnswer"
              value={securityAnswer}
              onChange={(event) => setSecurityAnswer(event.target.value)}
              required
            />
          </>
        )}

        {step === 3 && (
          <>
            <AuthInput
              label="New password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              showPasswordToggle
            />
            <PasswordRequirements password={newPassword} />
          </>
        )}

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <PrimaryButton
          type="submit"
          disabled={
            isSubmitting || (step === 2 ? !isAnswerValid : !isNewPasswordValid)
          }
          label={
            isSubmitting
              ? "Please wait..."
              : step === 2
                ? "Verify answer"
                : "Reset password"
          }
        />

        {step === 3 && (
          <button
            type="button"
            className="auth-back-button"
            onClick={() => {
              setStep(2);
              setErrorMessage("");
            }}
            disabled={isSubmitting}
          >
            Back to security question
          </button>
        )}

        <p className="auth-footer">
          Want to leave?
          <button
            type="button"
            className="switch-link"
            onClick={() => navigate("/profile")}
          >
            Back to profile
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default AuthResetPassword;
