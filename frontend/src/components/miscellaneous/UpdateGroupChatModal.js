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
  useBreakpointValue,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import api from "../../config/axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [newGroupChatName, setNewGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const toast = useToast();
  const modalSize = useBreakpointValue({ base: "full", md: "lg" });

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
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    if (selectedChat.groupAdmin?._id !== user._id) {
      return toast({
        title: "Only admins can add users",
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
        colorScheme="gray"
        aria-label="View Group"
        size="sm"
      />

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" bg="gray.100" color="gray.800">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="semibold">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              p={2}
              mb={4}
              maxH="120px"
              overflowY="auto"
              borderRadius="md"
              bg="gray.200"
              border="1px solid"
              borderColor="gray.300"
            >
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>

            <VStack spacing={3}>
              <FormControl display="flex" alignItems="center">
                <Input
                  placeholder="Rename Group"
                  value={newGroupChatName}
                  onChange={(e) => setNewGroupChatName(e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                />
                <Button
                  ml={2}
                  isLoading={renameLoading}
                  onClick={handleRename}
                  colorScheme="blue"
                >
                  Update
                </Button>
              </FormControl>

              <FormControl>
                <Input
                  placeholder="Search to add members"
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="white"
                  borderColor="gray.300"
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>
            </VStack>

            <Box mt={3} maxH="150px" overflowY="auto">
              {loading ? (
                <Spinner color="blue.500" />
              ) : (
                searchResult
                  .slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              w="full"
              colorScheme="red"
              variant="outline"
              onClick={() => handleRemove(user)}
              _hover={{ bg: "red.100" }}
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
