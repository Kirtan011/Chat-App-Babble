import { useEffect } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSenderFull } from "./config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import moment from "moment";

const MyChats = ({ fetchAgain }) => {
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChat = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
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

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="30px"
      borderWidth="3px"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow="12px 12px 8px rgba(0, 0, 0, 0.15)"
      _hover={{
        boxShadow: "12px 12px 12px rgba(0, 0, 0, 0.15)",
        transform: "scale(1.005)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        fontSize={{ base: "28px", md: "31px" }}
        fontFamily="Work sans"
        w="100%"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            borderRadius="24px"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflow="hidden"
      >
        {chats ? (
          <Stack spacing={3} overflowY="scroll" px={1}>
            {chats.map((chat) => {
              const isSelected = selectedChat?._id === chat._id;
              const displayUser = getSenderFull(user, chat.users);
              const lastActive = chat.latestMessage?.updatedAt;

              return (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  px={4}
                  py={3}
                  borderRadius="xl"
                  bg={isSelected ? "blue.200" : "gray.200"}
                  color={isSelected ? "white" : "black"}
                  boxShadow={isSelected ? "lg" : "sm"}
                  _hover={{
                    transform: "scale(1.01)",
                    boxShadow: "md",
                    transition: "all 0.2s ease-in-out",
                  }}
                  transition="all 0.2s"
                >
                  <HStack
                    spacing={3}
                    align="center"
                    justifyContent="space-between"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={
                          chat.isGroupChat ? chat.chatName : displayUser?.name
                        }
                        src={!chat.isGroupChat ? displayUser?.pic : undefined}
                      />
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        {chat.isGroupChat ? chat.chatName : displayUser?.name}
                      </Text>
                    </HStack>
                    {lastActive && (
                      <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                        {moment(lastActive).fromNow()}
                      </Text>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
