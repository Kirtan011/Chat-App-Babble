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
      w={{ base: "100%", md: "68%" }}
      h="100%"
      bg="white"
      borderRadius="24px"
      ml={{ base: 0, md: 2 }}
      p={{ base: 2, md: 4 }}
      boxShadow="lg"
      border="3px solid"
      borderColor="gray.200"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "xl",
        transform: "scale(1.01)",
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
