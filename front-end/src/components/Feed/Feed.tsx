import Post from "../Post/Post";
import type { ProfileConnection, ProfilePost } from "../../services/profile";

import "./feed.css";

type FeedProps = {
  posts: ProfilePost[];
  fallbackAuthor?: ProfileConnection;
  currentUserId?: string;
  emptyMessage?: string;
};

function Feed({
  posts,
  fallbackAuthor,
  currentUserId,
  emptyMessage = "No posts yet.",
}: FeedProps) {
  if (posts.length === 0) {
    return <p className="feed__empty">{emptyMessage}</p>;
  }

  return (
    <section className="feed" aria-label="Post feed">
      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
          fallbackAuthor={fallbackAuthor}
          currentUserId={currentUserId}
        />
      ))}
    </section>
  );
}

export default Feed;
