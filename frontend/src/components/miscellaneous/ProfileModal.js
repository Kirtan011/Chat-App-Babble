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
  VStack,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

const MotionModalContent = motion(ModalContent);

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      {children ? (
        <span onClick={onOpen} style={{ cursor: "pointer" }}>
          {children}
        </span>
      ) : (
        <IconButton
          icon={<ViewIcon />}
          onClick={onOpen}
          bgGradient="linear(to-r, teal.400, blue.500)"
          color="white"
          _hover={{
            bgGradient: "linear(to-r, teal.500, blue.600)",
            scale: 1.05,
          }}
          borderRadius="full"
          boxShadow="md"
          transition="0.2s"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.400" />

        <MotionModalContent
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.2)"
          p={6}
          maxW="420px"
          color="white"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ModalHeader
            textAlign="center"
            fontSize="2xl"
            fontWeight="extrabold"
            fontFamily="Poppins, sans-serif"
            letterSpacing="wide"
            bgGradient="linear(to-r, teal.300, blue.400)"
            bgClip="text"
          >
            {user.name}
          </ModalHeader>

          <ModalCloseButton color="whiteAlpha.800" />

          <ModalBody>
            <VStack spacing={5} align="center">
              <Image
                borderRadius="full"
                boxSize="150px"
                src={user.pic}
                alt={user.name}
                border="3px solid rgba(255,255,255,0.4)"
                boxShadow="0 0 15px rgba(0,0,0,0.3)"
              />
              <Text fontSize="md" color="whiteAlpha.900">
                <b>Email:</b> {user.email}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button
              onClick={onClose}
              bgGradient="linear(to-r, teal.400, blue.500)"
              color="white"
              borderRadius="full"
              px={8}
              _hover={{
                bgGradient: "linear(to-r, teal.500, blue.600)",
                scale: 1.05,
              }}
              transition="0.2s"
              shadow="md"
            >
              Close
            </Button>
          </ModalFooter>
        </MotionModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileModal;
