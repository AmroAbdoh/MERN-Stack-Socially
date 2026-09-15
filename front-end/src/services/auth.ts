const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Credentials = {
  email: string;
  password: string;
};

type RegistrationDetails = Credentials & {
  name: string;
  username: string;
  securityQuestion: string;
  securityAnswer: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role?: string;
  };
};

type ForgotPasswordResponse = {
  securityQuestion: string;
};

type VerifySecurityAnswerResponse = {
  resetToken: string;
};

const request = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_URL}/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
};

const loginUser = (credentials: Credentials): Promise<AuthResponse> =>
  request<AuthResponse>("/login", credentials);

const registerUser = (details: RegistrationDetails): Promise<AuthResponse> =>
  request<AuthResponse>("/register", details);

const checkRegistrationAvailability = (
  email: string,
  username: string,
): Promise<{ available: true }> =>
  request<{ available: true }>("/check-availability", { email, username });

const requestPasswordReset = (email: string): Promise<ForgotPasswordResponse> =>
  request<ForgotPasswordResponse>("/forgot-password", { email });

const verifySecurityAnswer = (
  email: string,
  securityAnswer: string,
): Promise<VerifySecurityAnswerResponse> =>
  request<VerifySecurityAnswerResponse>("/verify-security-answer", {
    email,
    securityAnswer,
  });

const resetPassword = (
  token: string,
  newPassword: string,
): Promise<{ message: string }> =>
  request<{ message: string }>("/reset-password", { token, newPassword });

export {
  loginUser,
  registerUser,
  checkRegistrationAvailability,
  requestPasswordReset,
  verifySecurityAnswer,
  resetPassword,
};
