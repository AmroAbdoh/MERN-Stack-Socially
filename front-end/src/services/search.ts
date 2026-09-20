import type { ProfileConnection, ProfilePost } from "./profile";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type SearchUser = Omit<ProfileConnection, "id"> & { _id: string };
export type SearchPost = ProfilePost;

const searchRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}/search${path}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to search right now");
  }

  return data as T;
};

const getSearchUsers = (query: string): Promise<{ users: SearchUser[] }> =>
  searchRequest<{ users: SearchUser[] }>(
    `/user?query=${encodeURIComponent(query.trim())}`,
  );

const getSearchPosts = (query: string): Promise<{ posts: SearchPost[] }> =>
  searchRequest<{ posts: SearchPost[] }>(
    `/post?query=${encodeURIComponent(query.trim())}`,
  );

export { getSearchUsers, getSearchPosts };
