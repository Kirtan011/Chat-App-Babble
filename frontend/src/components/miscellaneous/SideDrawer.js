import { useState } from "react";
import {
  Box,
  Tooltip,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  MenuDivider,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Input,
  DrawerHeader,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import ChatLoading from "../ChatLoading.js";
import UserListItem from "../UserAvatar/UserListItem.js";
import { getSender } from "../config/ChatLogics.js";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const logOutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
    window.location.reload();
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 1000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: "Failed to load search results",
        status: "error",
        duration: 1500,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching chat",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="8px 12px"
        borderBottom="2px solid"
        borderColor="gray.100"
        shadow="md"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-start">
          <Button
            variant="ghost"
            onClick={onOpen}
            borderRadius="full"
            _hover={{ bg: "gray.100" }}
          >
            <i className="fas fa-search" />
            <Text ml={2} display={{ base: "none", md: "inline" }}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize="3xl"
          fontWeight="bold"
          fontFamily="Baloo 2"
          bgGradient="linear(to-r, teal.400, blue.500)"
          bgClip="text"
          sx={{ WebkitTextFillColor: "transparent" }}
        >
          BABBLE
        </Text>

        <Flex gap={2} alignItems="center">
          <Menu>
            <MenuButton>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" />
            </MenuButton>
            <MenuList>
              {!notification.length && <MenuItem>No new messages</MenuItem>}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New message in ${notif.chat.chatName}`
                    : `New message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="white">
              <Avatar size="sm" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logOutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent borderRadius="md">
          <DrawerHeader borderBottomWidth="1px" textAlign="center">
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Flex pb={3} gap={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="lg"
              />
              <Button
                onClick={handleSearch}
                colorScheme="blue"
                borderRadius="lg"
              >
                Go
              </Button>
            </Flex>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="block" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
