import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import api from "../../../config/axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [newGroupChatName, setNewGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const toast = useToast();

  const handleRename = async () => {
    if (!newGroupChatName) return;
    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: newGroupChatName },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "Rename failed",
        description: error.response?.data?.message || "Unexpected error",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
      setNewGroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return setSearchResult([]);
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get(`/api/user?searchedUser=${query}`, config);
      setSearchResult(data);
    } catch {
      toast({
        title: "User search failed",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      return toast({
        title: "User already in group!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    if (selectedChat.groupAdmin?._id !== user._id) {
      return toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch {
      toast({
        title: "Could not add user",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (
      selectedChat.groupAdmin._id !== user._id &&
      userToRemove._id !== user._id
    ) {
      return toast({
        title: "Only admins can remove users!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put(
        "/api/chat/groupremove",
        { chatId: selectedChat._id, userId: userToRemove._id },
        config
      );
      if (userToRemove._id === user._id) setSelectedChat(null);
      else setSelectedChat(data);

      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch {
      toast({
        title: "Could not remove user",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        icon={<ViewIcon />}
        onClick={onOpen}
        variant="outline"
        colorScheme="blue"
        aria-label="View Group"
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="lg" bg="gray.700" color="white">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              display="flex"
              flexWrap="wrap"
              mb={3}
              maxH="120px"
              overflowY="auto"
              p={2}
              border="1px solid"
              borderColor="gray.600"
              borderRadius="md"
              bg="gray.600"
            >
              {selectedChat?.users?.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>

            <VStack spacing={4}>
              <FormControl display="flex">
                <Input
                  placeholder="Rename Group"
                  value={newGroupChatName}
                  onChange={(e) => setNewGroupChatName(e.target.value)}
                  bg="gray.600"
                  _placeholder={{ color: "gray.400" }}
                  borderColor="gray.500"
                  color="white"
                />
                <Button
                  ml={2}
                  isLoading={renameLoading}
                  onClick={handleRename}
                  colorScheme="teal"
                >
                  Update
                </Button>
              </FormControl>

              <FormControl>
                <Input
                  placeholder="Search to add members"
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="gray.600"
                  _placeholder={{ color: "gray.400" }}
                  borderColor="gray.500"
                  color="white"
                />
              </FormControl>
            </VStack>

            <Box mt={3} maxH="150px" overflowY="auto">
              {loading ? (
                <Spinner color="teal.400" />
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((u) => (
                    <UserListItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleAddUser(u)}
                    />
                  ))
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              w="full"
              colorScheme="red"
              onClick={() => handleRemove(user)}
              _hover={{ bg: "red.600" }}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
