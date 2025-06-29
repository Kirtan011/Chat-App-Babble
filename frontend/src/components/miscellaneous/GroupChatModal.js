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
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchedUser, setSearchedUser] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  //Everytime this Modal opens(renders) it clears all the previous data
  useEffect(() => {
    if (isOpen) {
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchedUser("");
      setSearchResult([]);
      setLoading(false);
    }
  }, [isOpen]);

  //Gives top 4 Searched Users
  const handleSearch = async (query) => {
    setSearchedUser(query);

    if (!query) {
      setSearchResult([]); // clear results when input is empty
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/user?searchedUser=${query}`,
        config
      );
      setSearchResult(data);
      console.log(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "User not available!",
        description: "Failed to load up the users ",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    setLoading(false);
  };

  //Creates Group Chat
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the field!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: selectedUsers,
        },
        config
      );

      setChats([data, ...chats]);
      onClose();
      toast({
        title: "Group Chat has been created  !",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Group not created!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  //Add User to Group
  const handleAddUser = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  //Delete User of Group
  const handleDeleteUser = (deleteUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== deleteUser._id));
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered={false}
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent
          mt="20px" // Push down from top
          maxHeight="90vh" // Don't exceed screen
          overflow="hidden" // Prevent scroll bleed
        >
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" overflow="hidden">
            <FormControl>
              <Input
                type="text"
                placeholder="Group name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <Input
                type="text"
                placeholder="Add member eg. Kirtan, Jeeval, Vikas..."
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {/* Selected Users */}
            <Box
              w="100%"
              display="flex"
              flexWrap="wrap"
              mb={2}
              overflowX="hidden"
            >
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDeleteUser(u)}
                />
              ))}
            </Box>

            {/* Scrollable Search Result Area */}
            <Box w="100%" flex="1" overflowY="auto" overflowX="hidden" pr={1}>
              {loading ? (
                <Spinner />
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
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
