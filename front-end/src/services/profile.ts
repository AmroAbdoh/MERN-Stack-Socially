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
  likedBy: Array<string | ProfileConnection>;
  postedBy?: ProfileConnection;
  visibility: "public" | "private";
  createdAt: string;
};

export type PostComment = {
  _id: string;
  text: string;
  createdAt: string;
  postedBy?: ProfileConnection | string;
};

export type ProfileConnection = Pick<
  ProfileUser,
  "id" | "name" | "username" | "avatar" | "bio"
>;

const authenticatedRequest = async <T>(
  path: string,
  requestInit: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: {
      ...requestInit.headers,
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

const getFollowSuggestions = (): Promise<{ users: ProfileConnection[] }> =>
  authenticatedRequest<{ users: ProfileConnection[] }>("/users/suggestions");

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

const getFollowingFeed = (): Promise<{ posts: ProfilePost[] }> =>
  authenticatedRequest<{ posts: ProfilePost[] }>("/feed?page=1&limit=20");

const getPostById = (postId: string): Promise<{ post: ProfilePost }> =>
  authenticatedRequest<{ post: ProfilePost }>(`/posts/${postId}`);

const getUserConnections = (
  username: string,
  connectionType: "followers" | "following",
): Promise<{ users: ProfileConnection[] }> =>
  authenticatedRequest<{ users: ProfileConnection[] }>(
    `/users/${encodeURIComponent(username)}/${connectionType}`,
  );

const followUser = (username: string): Promise<{ following: boolean }> =>
  authenticatedRequest<{ following: boolean }>(
    `/users/${encodeURIComponent(username)}/follow`,
    { method: "POST" },
  );

const unfollowUser = (username: string): Promise<{ following: boolean }> =>
  authenticatedRequest<{ following: boolean }>(
    `/users/${encodeURIComponent(username)}/follow`,
    { method: "DELETE" },
  );

const getCurrentProfilePath = (): string => {
  const username = localStorage.getItem("userUsername");
  return username ? `/profile/${encodeURIComponent(username)}` : "/profile";
};

const createPost = async (details: {
  description: string;
  visibility: "public" | "private";
  images: File[];
}): Promise<{ post: ProfilePost }> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("description", details.description);
  formData.append("visibility", details.visibility);
  details.images.forEach((image) => formData.append("images", image));

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Unable to create post");
  return data as { post: ProfilePost };
};

const likePost = (postId: string): Promise<{ likesCount: number }> =>
  authenticatedRequest<{ likesCount: number }>(`/posts/${postId}/like`, {
    method: "POST",
  });

const unlikePost = (postId: string): Promise<{ likesCount: number }> =>
  authenticatedRequest<{ likesCount: number }>(`/posts/${postId}/like`, {
    method: "DELETE",
  });

const getPostComments = (
  postId: string,
): Promise<{ comments: PostComment[] }> =>
  authenticatedRequest<{ comments: PostComment[] }>(
    `/posts/${postId}/comments`,
  );

const createComment = (
  postId: string,
  text: string,
): Promise<{ comment: PostComment }> =>
  authenticatedRequest<{ comment: PostComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });

const updatePost = async (
  postId: string,
  details: Pick<ProfilePost, "description" | "visibility">,
): Promise<{ post: ProfilePost }> =>
  authenticatedRequest<{ post: ProfilePost }>(`/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });

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
  getFollowSuggestions,
  getProfileByUsername,
  getMyPosts,
  getUserPosts,
  getFollowingFeed,
  getPostById,
  getUserConnections,
  followUser,
  unfollowUser,
  getCurrentProfilePath,
  createPost,
  likePost,
  unlikePost,
  getPostComments,
  createComment,
  updatePost,
  updateProfile,
  updateAvatar,
  removeAvatar,
};
