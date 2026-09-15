import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthInput from "../../components/InputField/InputField";
import PrimaryButton from "../../components/auth/Button";
import PasswordRequirements from "../../components/PasswordRequirements/PasswordRequirements";
import AuthLayout from "../../layout/AuthLayout/AuthLayout";
import {
  requestPasswordReset,
  resetPassword,
  verifySecurityAnswer,
} from "../../services/auth";

import "./AuthPage.css";

type ResetStep = 1 | 2 | 3;

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (step === 1) {
        const response = await requestPasswordReset(email);
        setSecurityQuestion(response.securityQuestion);
        setStep(2);
        return;
      }

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

  const goBack = () => {
    setErrorMessage("");
    setStep((currentStep) =>
      currentStep === 1 ? 1 : ((currentStep - 1) as ResetStep),
    );
  };

  return (
    <AuthLayout
      title="Find your way back."
      description="Reset your password securely and get back to the conversations that matter."
    >
      <div className="auth-header">
        <h2>Reset password</h2>
        <p>
          {step === 1 && "Enter your email to find your account."}
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
        {step === 1 && (
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        )}

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
          disabled={isSubmitting}
          label={
            isSubmitting
              ? "Please wait..."
              : step === 1
                ? "Continue"
                : step === 2
                  ? "Verify answer"
                  : "Reset password"
          }
        />

        {step > 1 && (
          <button
            type="button"
            className="auth-back-button"
            onClick={goBack}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}

        <p className="auth-footer">
          Remember your password?
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

export default ForgotPassword;
