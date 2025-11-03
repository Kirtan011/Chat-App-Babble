import { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Stack,
  Text,
  useToast,
  VStack,
  InputGroup,
  Input,
  InputLeftElement,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSenderFull } from "./config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import moment from "moment";
import api from "../config/axios";

const MyChats = ({ fetchAgain }) => {
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchChat = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load chats.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchChat();
    }
  }, [fetchAgain, user]);

  // Filter chats dynamically based on search term
  const filteredChats = chats?.filter((chat) => {
    if (chat.isGroupChat) {
      return chat.chatName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const displayUser = getSenderFull(user, chat.users);
    return displayUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={4}
      bg="rgba(255, 255, 255, 0.6)"
      backdropFilter="blur(20px)"
      w={{ base: "100%", md: "32%" }}
      borderRadius="28px"
      border="1px solid rgba(255,255,255,0.3)"
      boxShadow="0 8px 24px rgba(0,0,0,0.15)"
      transition="all 0.3s ease-in-out"
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        fontSize={{ base: "24px", md: "28px" }}
        fontFamily="Poppins, sans-serif"
        w="100%"
        fontWeight="600"
        color="gray.800"
      >
        Chats
        <GroupChatModal>
          <Button
            bgGradient="linear(to-r, teal.400, blue.400)"
            color="white"
            borderRadius="lg"
            fontWeight="500"
            fontSize={{ base: "14px", md: "16px" }}
            rightIcon={<AddIcon />}
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 0 12px rgba(56,189,248,0.5)",
            }}
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>

      {/* Search Bar */}
      <InputGroup
        w="100%"
        mb={3}
        mt={1}
        bg="whiteAlpha.700"
        borderRadius="lg"
        shadow="sm"
      >
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search chats..."
          border="none"
          focusBorderColor="blue.300"
          _placeholder={{ color: "gray.500" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Chat list */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="rgba(255,255,255,0.5)"
        backdropFilter="blur(12px)"
        w="100%"
        h="100%"
        borderRadius="xl"
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#a0aec0",
            borderRadius: "5px",
          },
        }}
      >
        {chats ? (
          <Stack spacing={3}>
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const isSelected = selectedChat?._id === chat._id;
                const displayUser = getSenderFull(user, chat.users);
                const lastMsg =
                  chat.latestMessage?.content || "No messages yet";
                const lastActive = chat.latestMessage?.updatedAt;

                return (
                  <Box
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    cursor="pointer"
                    p={3}
                    borderRadius="lg"
                    bg={
                      isSelected
                        ? "linear-gradient(90deg, #63b3ed, #3182ce)"
                        : "whiteAlpha.700"
                    }
                    color={isSelected ? "white" : "gray.800"}
                    boxShadow={
                      isSelected ? "0 4px 12px rgba(66,153,225,0.5)" : "sm"
                    }
                    _hover={{
                      transform: "scale(1.02)",
                      boxShadow: "md",
                      transition: "0.2s",
                    }}
                    transition="all 0.2s ease-in-out"
                  >
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Avatar
                          size="md"
                          name={
                            chat.isGroupChat ? chat.chatName : displayUser?.name
                          }
                          src={!chat.isGroupChat ? displayUser?.pic : undefined}
                          border={
                            isSelected
                              ? "2px solid white"
                              : "2px solid transparent"
                          }
                        />
                        <VStack align="start" spacing={0}>
                          <Text
                            fontWeight="semibold"
                            fontSize="md"
                            noOfLines={1}
                          >
                            {chat.isGroupChat
                              ? chat.chatName
                              : displayUser?.name}
                          </Text>
                          <Text fontSize="sm" opacity={0.8} noOfLines={1}>
                            {lastMsg}
                          </Text>
                        </VStack>
                      </HStack>
                      {lastActive && (
                        <Text fontSize="xs" opacity={0.6}>
                          {moment(lastActive).fromNow()}
                        </Text>
                      )}
                    </HStack>
                  </Box>
                );
              })
            ) : (
              <Text textAlign="center" color="gray.500">
                No chats found
              </Text>
            )}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
