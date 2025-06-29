import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React from "react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Flex
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      fontSize={12}
      bg="green.600"
      color="white"
      align="center"
      gap={2}
      maxW="fit-content"
    >
      <Text fontSize="sm">{user.name}</Text>
      <Button
        onClick={handleFunction}
        size="xs"
        variant="ghost"
        colorScheme="white"
        borderRadius="full"
        p={1}
        minW="unset"
        h="20px"
      >
        <CloseIcon fontSize="10px" />
      </Button>
    </Flex>
  );
};

export default UserBadgeItem;
