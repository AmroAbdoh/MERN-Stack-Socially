import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ConversationList from "../../components/ConversationList/ConversationList";
import ConversationPanel from "../../components/ConversationPanel/ConversationPanel";
import {
  connectMessageSocket,
  getConversation,
  getMessageContacts,
  sendMessage,
  type MessageItem,
  type MessageUser,
} from "../../services/messaging";
import { getCurrentProfile } from "../../services/profile";

import "./messaging.css";

function Messaging() {
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get("user");
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<MessageUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const selectedUserRef = useRef<MessageUser | null>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser && !isConversationLoading) {
      window.dispatchEvent(new Event("messagesread"));
    }
  }, [isConversationLoading, selectedUser]);

  useEffect(() => {
    let isCurrent = true;
    let socket: ReturnType<typeof connectMessageSocket> | undefined;

    const loadContacts = async () => {
      try {
        const [profileResponse, contactsResponse] = await Promise.all([
          getCurrentProfile(),
          getMessageContacts(requestedUserId || undefined),
        ]);
        if (!isCurrent) return;
        setCurrentUserId(profileResponse.user.id);
        setUsers(contactsResponse.users);
        const requestedUser = contactsResponse.users.find(
          (user) => user.id === requestedUserId,
        );
        setSelectedUser(requestedUser || contactsResponse.users[0] || null);
        socket = connectMessageSocket(profileResponse.user.id);
        socket.on("newMessage", () => {
          void getMessageContacts(requestedUserId || undefined).then((latest) => {
            if (isCurrent) setUsers(latest.users);
          });
          const activeUser = selectedUserRef.current;
          if (!activeUser) return;

          void getConversation(activeUser.id).then((response) => {
            if (isCurrent) setMessages(response.messages);
          });
        });
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load messages.",
          );
        }
      } finally {
        if (isCurrent) setIsContactsLoading(false);
      }
    };

    void loadContacts();
    return () => {
      isCurrent = false;
      socket?.emit("leaveRoom", currentUserId);
      socket?.disconnect();
    };
  }, [requestedUserId]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    let isCurrent = true;
    setIsConversationLoading(true);
    setErrorMessage("");
    void getConversation(selectedUser.id)
      .then((response) => {
        if (isCurrent) setMessages(response.messages);
      })
      .catch((error) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load conversation.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsConversationLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedUser]);

  const handleSend = async (text: string) => {
    if (!selectedUser) return;
    setIsSending(true);
    setErrorMessage("");
    try {
      const response = await sendMessage(selectedUser.id, text);
      setMessages((currentMessages) => [...currentMessages, response.data]);
      const latestContacts = await getMessageContacts(
        requestedUserId || undefined,
      );
      setUsers(latestContacts.users);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send message.",
      );
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectUser = (user: MessageUser) => {
    setSelectedUser(user);
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? { ...currentUser, unreadCount: 0 }
          : currentUser,
      ),
    );
  };

  return (
    <main className="messaging-page">
      {errorMessage && !selectedUser && (
        <p className="messaging-page__error">{errorMessage}</p>
      )}
      <div className="messaging-page__workspace">
        <ConversationList
          users={users}
          selectedUserId={selectedUser?.id}
          isLoading={isContactsLoading}
          onSelect={handleSelectUser}
        />
        <ConversationPanel
          currentUserId={currentUserId}
          selectedUser={selectedUser}
          messages={messages}
          isLoading={isConversationLoading}
          isSending={isSending}
          errorMessage={errorMessage}
          onSend={handleSend}
        />
      </div>
    </main>
  );
}

export default Messaging;
