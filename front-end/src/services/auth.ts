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

export { loginUser, registerUser };
