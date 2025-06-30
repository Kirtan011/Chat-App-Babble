import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  useToast,
  FormControl,
  Spinner,
  Box,
  Text,
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import api from "../../config/axios";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  useEffect(() => {
    if (isOpen) {
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchedUser("");
      setSearchResult([]);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSearch = async (query) => {
    setSearchedUser(query);
    if (!query) return setSearchResult([]);

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await api.get(`/api/user?searchedUser=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not fetch users",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({
        title: "Missing fields",
        description: "Group name and members required",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await api.post(
        "/api/chat/group",
        { name: groupChatName, users: selectedUsers },
        config
      );
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "Group created!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to create group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleAddUser = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDeleteUser = (userToDelete) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToDelete._id));
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="lg">
          <ModalHeader textAlign="center" fontSize="2xl" fontWeight="bold">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody display="flex" flexDirection="column" gap={4}>
            <FormControl>
              <Input
                placeholder="Group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                borderRadius="xl"
              />
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add users (e.g. John, Alice...)"
                onChange={(e) => handleSearch(e.target.value)}
                borderRadius="xl"
              />
            </FormControl>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDeleteUser(user)}
                />
              ))}
            </Box>

            <Box
              maxH="200px"
              overflowY="auto"
              pr={1}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {loading ? (
                <Spinner alignSelf="center" />
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
              )}
              {!loading && searchedUser && searchResult.length === 0 && (
                <Text color="gray.500" textAlign="center" fontSize="sm">
                  No users found
                </Text>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              borderRadius="full"
              px={6}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
