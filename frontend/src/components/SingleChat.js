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
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import typingAnimation from "../animation/typing.json";

const ENDPOINT = "http://localhost:5000";
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(null);

  const toast = useToast();
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);
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
      const { data } = await axios.get(
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

        const { data } = await axios.post(
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
          justifyContent="flex-start"
          alignItems="stretch"
          h="100%"
          w="100%"
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={4}
            py={3}
            fontFamily="Work sans"
            fontSize={{ base: "24px", md: "30px" }}
            borderRadius="lg"
            boxShadow="sm"
            bg="white"
            mb={1}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat()}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                <span>{selectedChat.chatName}</span>
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
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            px={3}
            py={2}
            bg="gray.100"
            w="100%"
            h="100%"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="inner"
          >
            {loading ? (
              <Spinner
                thickness="2px"
                speed="0.8s"
                emptyColor="gray.100"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="blue.500"
              />
            ) : (
              <Box
                className="messages"
                style={{
                  height: "100%",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  paddingRight: "4px",
                }}
              >
                <ScrollableChat messages={messages} />
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

            {/* Input and Send */}
            <FormControl
              display="flex"
              alignItems="center"
              gap={2}
              mt={3}
              onKeyDown={sendMessage}
              isRequired
            >
              <Input
                variant="filled"
                bg="white"
                flex="1"
                borderRadius="20px"
                fontSize={{ base: "15px", md: "18px" }}
                placeholder="Type a message..."
                onChange={handleTyping}
                value={newMessage}
                _focus={{ bg: "white", borderColor: "blue.300" }}
              />

              <IconButton
                icon={<ArrowForwardIcon />}
                aria-label="Send"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                borderRadius="full"
                onClick={sendMessage}
                display={{ base: "flex", md: "none" }}
              />

              <Button
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                borderRadius="full"
                px={6}
                onClick={sendMessage}
                display={{ base: "none", md: "flex" }}
              >
                Send
              </Button>
            </FormControl>
          </Box>
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
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
