import React from "react";
import {
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  Text,
  Box,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          icon={<ViewIcon />}
          onClick={onOpen}
          bg="blue.500"
          color="white"
          _hover={{ bg: "blue.600" }}
          borderRadius="full"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
        <ModalContent
          bg="white"
          borderRadius="2xl"
          boxShadow="lg"
          p={4}
          maxW="400px"
        >
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            fontFamily="Work sans"
            color="gray.700"
          >
            {user.name}
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
              border="4px solid"
              borderColor="blue.300"
              shadow="md"
            />
            <Text fontSize="lg" color="gray.600">
              <b>Email:</b> {user.email}
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              onClick={onClose}
              colorScheme="blue"
              borderRadius="full"
              px={6}
              _hover={{ bg: "blue.600" }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileModal;
