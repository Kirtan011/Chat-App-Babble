import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo"));
  });

  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    if (location.pathname === "/chats") {
      setUser(JSON.parse(localStorage.getItem("userInfo")));
    }
  }, [location.pathname]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => useContext(ChatContext);

export default ChatProvider;
