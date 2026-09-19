const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getAssetUrl = (assetPath?: string): string => {
  if (!assetPath) return "";
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.startsWith("/")
    ? assetPath
    : `/${assetPath}`;

  return `${API_ORIGIN}${normalizedPath}`;
};

export type ProfileUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  role: "user" | "admin";
};

export type ProfilePost = {
  _id: string;
  description: string;
  photos: string[];
  likedBy: string[];
  visibility: "public" | "private";
  createdAt: string;
};

export type ProfileConnection = Pick<
  ProfileUser,
  "id" | "name" | "username" | "avatar" | "bio"
>;

const authenticatedRequest = async <T>(path: string): Promise<T> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load profile data");
  }

  return data as T;
};

const getCurrentProfile = (): Promise<{ user: ProfileUser }> =>
  authenticatedRequest<{ user: ProfileUser }>("/users/me");

const getProfileByUsername = (
  username: string,
): Promise<{ user: ProfileUser }> =>
  authenticatedRequest<{ user: ProfileUser }>(
    `/users/${encodeURIComponent(username)}`,
  );

const getMyPosts = (): Promise<{ posts: ProfilePost[] }> =>
  authenticatedRequest<{ posts: ProfilePost[] }>("/posts/me");

const getUserPosts = (username: string): Promise<{ posts: ProfilePost[] }> =>
  authenticatedRequest<{ posts: ProfilePost[] }>(
    `/posts/user/${encodeURIComponent(username)}`,
  );

const getUserConnections = (
  username: string,
  connectionType: "followers" | "following",
): Promise<{ users: ProfileConnection[] }> =>
  authenticatedRequest<{ users: ProfileConnection[] }>(
    `/users/${encodeURIComponent(username)}/${connectionType}`,
  );

const getCurrentProfilePath = (): string => {
  const username = localStorage.getItem("userUsername");
  return username ? `/profile/${encodeURIComponent(username)}` : "/profile";
};

const updateProfile = async (details: {
  name: string;
  username: string;
  bio: string;
}): Promise<{ user: ProfileUser }> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(details),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Unable to update profile");
  return data as { user: ProfileUser };
};

const updateAvatar = async (file: File): Promise<{ avatar: string }> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Unable to update avatar");
  return data as { avatar: string };
};

const removeAvatar = async (): Promise<{ avatar: string }> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Unable to remove avatar");
  return data as { avatar: string };
};

export {
  getAssetUrl,
  getCurrentProfile,
  getProfileByUsername,
  getMyPosts,
  getUserPosts,
  getUserConnections,
  getCurrentProfilePath,
  updateProfile,
  updateAvatar,
  removeAvatar,
};
