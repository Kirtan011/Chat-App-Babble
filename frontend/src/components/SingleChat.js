// SingleChat.js
import { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "./config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "lottie-react";
import typingAnimation from "../animation/typing.json";
import api from "../config/axios";

const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://chat-app-babble.onrender.com"
    : "http://localhost:5000";

let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(null);

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", (chatId) => {
      if (selectedChatCompare && selectedChatCompare._id === chatId) {
        setIsTyping(true);
      }
    });

    socket.on("stop typing", (chatId) => {
      if (selectedChatCompare && selectedChatCompare._id === chatId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;

    selectedChatCompare = selectedChat;
    fetchMessages();
    socket.emit("stop typing", selectedChat._id);
    setIsTyping(false);
  }, [selectedChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await api.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to fetch the messages",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.find((n) => n._id === newMessageReceived._id)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
    };
  }, [notification, fetchAgain]);

  const sendMessage = async (event) => {
    if ((event.key === "Enter" || event.type === "click") && newMessage) {
      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await api.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        setNewMessage("");
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the message",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;

    const now = new Date().getTime();

    if (!lastTypingTimeRef.current || now - lastTypingTimeRef.current > 1000) {
      socket.emit("typing", selectedChat._id);
      lastTypingTimeRef.current = now;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
    }, 3000);
  };

  return (
    <>
      {selectedChat ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="stretch"
          h="100%"
          w="100%"
          bg="gray.50"
          borderRadius="2xl"
          p={{ base: 2, md: 4 }}
          boxShadow="lg"
          overflow="hidden"
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: 2, md: 4 }}
            py={{ base: 2, md: 3 }}
            fontFamily="Work sans"
            fontSize={{ base: "20px", md: "28px" }}
            fontWeight="bold"
            borderBottom="1px solid"
            borderColor="gray.200"
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat()}
              variant="ghost"
              aria-label="Back"
            />

            {!selectedChat.isGroupChat ? (
              <>
                <Text>{getSender(user, selectedChat.users)}</Text>
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                <Text>{selectedChat.chatName}</Text>
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Box>

          {/* Message Area */}
          <Box
            flex="1"
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            bg="gray.100"
            p={3}
            mt={2}
            borderRadius="xl"
            boxShadow="inner"
            overflow="hidden"
          >
            {loading ? (
              <Spinner
                thickness="3px"
                speed="0.65s"
                emptyColor="gray.100"
                w={16}
                h={16}
                alignSelf="center"
                color="blue.400"
              />
            ) : (
              <Box
                className="messages"
                h="100%"
                overflowY="auto"
                pr={2}
                sx={{
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#CBD5E0",
                    borderRadius: "10px",
                  },
                }}
              >
                <ScrollableChat messages={messages} />
                <div ref={messagesEndRef} />
              </Box>
            )}

            {isTyping && (
              <Box px={2} mt={1}>
                <Lottie
                  animationData={typingAnimation}
                  loop
                  style={{ width: 60, height: 27 }}
                />
              </Box>
            )}
          </Box>

          {/* Input */}
          <FormControl
            onKeyDown={sendMessage}
            isRequired
            mt={3}
            display="flex"
            gap={2}
            alignItems="center"
          >
            <Input
              variant="filled"
              bg="white"
              placeholder="Type a message..."
              borderRadius="full"
              px={5}
              py={6}
              value={newMessage}
              onChange={handleTyping}
              fontSize="18px"
              _focus={{
                borderColor: "blue.300",
                boxShadow: "0 0 0 2px rgba(66,153,225,0.6)",
                bg: "white",
              }}
            />

            <IconButton
              icon={<ArrowForwardIcon />}
              aria-label="Send"
              bg="blue.500"
              color="white"
              borderRadius="full"
              _hover={{ bg: "blue.600" }}
              onClick={sendMessage}
              display={{ base: "flex", md: "none" }}
            />

            <Button
              display={{ base: "none", md: "flex" }}
              bg="blue.500"
              color="white"
              borderRadius="full"
              px={6}
              onClick={sendMessage}
              _hover={{ bg: "blue.600" }}
            >
              Send
            </Button>
          </FormControl>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          w="100%"
          textAlign="center"
          flexDirection="column"
          bg="gray.50"
          borderRadius="2xl"
        >
          <Text fontSize="3xl" fontFamily="Work sans" color="gray.600">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
