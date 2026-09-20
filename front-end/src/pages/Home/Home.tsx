import { useEffect, useState } from "react";

import PrimaryButton from "../../components/Button/Button";
import Feed from "../../components/Feed/Feed";
import FollowSuggestions from "../../components/FollowSuggestions/FollowSuggestions";
import MessageAvatarRail from "../../components/MessageAvatarRail/MessageAvatarRail";
import CreatePost from "../Profile/CreatePost";
import {
  getMessageContacts,
  connectMessageSocket,
  type MessageUser,
} from "../../services/messaging";
import {
  getCurrentProfile,
  getFollowSuggestions,
  getFollowingFeed,
  type ProfileConnection,
  type ProfilePost,
} from "../../services/profile";

import "./home.css";

function Home() {
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [messageUsers, setMessageUsers] = useState<MessageUser[]>([]);
  const [suggestions, setSuggestions] = useState<ProfileConnection[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postDraft, setPostDraft] = useState("");

  useEffect(() => {
    let isCurrent = true;
    void Promise.all([
      getCurrentProfile(),
      getFollowingFeed(),
      getMessageContacts(),
      getFollowSuggestions(),
    ])
      .then(
        ([
          profileResponse,
          feedResponse,
          contactsResponse,
          suggestionsResponse,
        ]) => {
          if (!isCurrent) return;
          setCurrentUserId(profileResponse.user.id);
          setPosts(feedResponse.posts);
          setMessageUsers(contactsResponse.users);
          setSuggestions(suggestionsResponse.users);
        },
      )
      .catch((error) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load your home feed.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
          setIsChatsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    let isCurrent = true;
    const socket = connectMessageSocket(currentUserId);
    const refreshChats = () => {
      void getMessageContacts().then((response) => {
        if (isCurrent) setMessageUsers(response.users);
      });
    };
    socket.on("newMessage", refreshChats);
    return () => {
      isCurrent = false;
      socket.off("newMessage", refreshChats);
      socket.disconnect();
    };
  }, [currentUserId]);

  return (
    <main className="home-page">
      <MessageAvatarRail users={messageUsers} isLoading={isChatsLoading} />
      <section className="home-page__feed">
        <header className="home-page__header">
          <form
            className="home-page__composer"
            onSubmit={(event) => {
              event.preventDefault();
              setIsCreatePostOpen(true);
            }}
          >
            <input
              type="text"
              value={postDraft}
              onChange={(event) => setPostDraft(event.target.value)}
              placeholder="What is on your mind?"
              maxLength={5000}
              aria-label="Post description"
            />
            <PrimaryButton label="Create post" type="submit" />
          </form>
        </header>
        {errorMessage ? (
          <p className="home-page__message home-page__message--error">
            {errorMessage}
          </p>
        ) : isLoading ? (
          <p className="home-page__message">Loading your feed...</p>
        ) : (
          <Feed
            posts={posts}
            currentUserId={currentUserId}
            emptyMessage="Your following feed is empty."
          />
        )}
      </section>
      <FollowSuggestions
        users={suggestions}
        onFollowed={(userId) =>
          setSuggestions((currentUsers) =>
            currentUsers.filter((user) => user.id !== userId),
          )
        }
      />
      {isCreatePostOpen && (
        <CreatePost
          onClose={() => setIsCreatePostOpen(false)}
          onCreated={(post) =>
            setPosts((currentPosts) => [post, ...currentPosts])
          }
          initialDescription={postDraft}
        />
      )}
    </main>
  );
}

export default Home;
