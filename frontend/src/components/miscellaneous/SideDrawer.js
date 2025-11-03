import { useState } from "react";
import {
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
  useToast,
  Badge,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../config/ChatLogics";
import api from "../../config/axios";

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
    if (!search.trim()) {
      toast({
        title: "Enter a name or email to search",
        status: "warning",
        duration: 1200,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/api/user?search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResult(data);
    } catch {
      toast({
        title: "Failed to fetch users",
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
      const { data } = await api.post(
        "/api/chat",
        { userId },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      onClose();
    } catch {
      toast({
        title: "Error opening chat",
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
        backdropFilter="blur(12px)"
        bg="rgba(255, 255, 255, 0.6)"
        borderBottom="1px solid"
        borderColor="gray.200"
        w="100%"
        p={{ base: 2, md: 3 }}
        px={{ base: 3, md: 5 }}
        boxShadow="0 2px 10px rgba(0,0,0,0.05)"
        position="sticky"
        top={0}
        zIndex={999}
      >
        <Tooltip label="Search Users" hasArrow placement="bottom-start">
          <Button
            onClick={onOpen}
            variant="ghost"
            borderRadius="full"
            leftIcon={<Search2Icon />}
            colorScheme="blue"
            fontWeight="medium"
            _hover={{ bg: "blue.50" }}
          >
            <Text display={{ base: "none", md: "inline" }}>Search</Text>
          </Button>
        </Tooltip>

        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          fontFamily="Baloo 2"
          bgGradient="linear(to-r, teal.400, blue.500)"
          bgClip="text"
          letterSpacing="wide"
        >
          Babble
        </Text>

        <Flex gap={3} alignItems="center">
          <Menu>
            <MenuButton
              position="relative"
              transition="0.2s ease"
              _hover={{ transform: "scale(1.1)" }}
            >
              <BellIcon fontSize="2xl" color="gray.700" />
              {notification.length > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  borderRadius="full"
                  px="2"
                  colorScheme="red"
                  fontSize="0.7em"
                  animation="pulse 1.5s infinite"
                  sx={{
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)", opacity: 1 },
                      "50%": { transform: "scale(1.3)", opacity: 0.7 },
                      "100%": { transform: "scale(1)", opacity: 1 },
                    },
                  }}
                >
                  {notification.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList borderRadius="xl" boxShadow="xl" py={2}>
              {!notification.length && (
                <MenuItem color="gray.500">No new messages</MenuItem>
              )}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  borderRadius="md"
                  _hover={{ bg: "blue.50" }}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `💬 ${notif.chat.chatName}`
                    : `🗨️ ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              borderRadius="full"
              px={2}
              _hover={{ bg: "blue.50" }}
            >
              <Avatar size="sm" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList borderRadius="xl" boxShadow="xl">
              <ProfileModal user={user}>
                <MenuItem fontWeight="500">My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem color="red.500" onClick={logOutHandler}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="sm">
        <DrawerOverlay />
        <DrawerContent
          bg="whiteAlpha.900"
          borderRadius={{ base: "none", md: "xl" }}
          mt={{ base: 0, md: 6 }}
          mb={{ base: 0, md: 6 }}
          mx={{ base: 0, md: 4 }}
          boxShadow="2xl"
        >
          <DrawerHeader
            borderBottomWidth="1px"
            textAlign="center"
            fontSize="xl"
            fontWeight="bold"
            color="blue.600"
          >
            🔍 Search Users
          </DrawerHeader>

          <DrawerBody>
            <Flex pb={3} gap={2} alignItems="center">
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="full"
                focusBorderColor="blue.400"
              />
              <Button
                onClick={handleSearch}
                colorScheme="blue"
                borderRadius="full"
                px={6}
                _hover={{ bg: "blue.500" }}
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

            {loadingChat && (
              <Spinner size="lg" mt={3} display="block" mx="auto" />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
