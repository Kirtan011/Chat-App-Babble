import { Box, Avatar, Text } from "@chakra-ui/react";
import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="rgba(255, 255, 255, 0.05)"
      border="1px solid rgba(255, 255, 255, 0.18)"
      backdropFilter="blur(8px)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      display="flex"
      alignItems="center"
      color="white"
      p={3}
      m={2}
      borderRadius="xl"
      transition="all 0.2s ease-in-out"
      _hover={{
        bg: "rgba(0, 128, 255, 0.2)",
        transform: "scale(1.02)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
      }}
      width="100%"
    >
      <Avatar
        mr={{ base: 3, md: 5 }}
        size="lg"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text
          fontSize={{ base: "sm", md: "lg" }}
          fontWeight="bold"
          color="blue.700"
        >
          {user.name}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.700">
          <b>Email:</b> {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
