import React from "react";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      justifyContent="center"
      w={{ base: "100%", md: "72%" }}
      h="100%"
      bgGradient="linear(to-b, white, gray.50)"
      borderRadius="2xl"
      ml={{ base: 0, md: 2 }}
      p={{ base: 3, md: 6 }}
      boxShadow="lg"
      border="2px solid"
      borderColor="gray.200"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "xl",
        transform: "scale(1.01)",
      }}
      overflowY="auto"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
