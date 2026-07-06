import { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  Text,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import api from "../../config/axios";
import FirebaseLogin from "./firebaseLogin";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();

  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Please fill all fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await api.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");

      // ✅ Immediately redirect after login
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await api.post(
        "/api/user/login",
        { email: "guest@example.com", password: "123456" },
        config
      );

      toast({
        title: "Guest Login Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
    setLoading(false);
  };

  return (
    <VStack spacing={5} align="stretch" w="100%">
      <FormControl id="login-email">
        <FormLabel
          fontSize="xs"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1.5}
        >
          Email Address
        </FormLabel>
        <Input
          name="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          autoComplete="new-email"
          onChange={(e) => setEmail(e.target.value)}
          borderRadius="xl"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          py={6}
          _focus={{
            bg: "white",
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.4)",
          }}
          _hover={{ borderColor: "gray.300" }}
          transition="all 0.2s"
        />
      </FormControl>

      <FormControl id="login-password">
        <FormLabel
          fontSize="xs"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1.5}
        >
          Password
        </FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            borderRadius="xl"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            py={6}
            _focus={{
              bg: "white",
              borderColor: "blue.500",
              boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.4)",
            }}
            _hover={{ borderColor: "gray.300" }}
            transition="all 0.2s"
          />
          <InputRightElement h="100%" width="4.5rem">
            <Button
              h="1.75rem"
              size="xs"
              variant="ghost"
              color="blue.500"
              fontWeight="bold"
              _hover={{ bg: "transparent", color: "blue.600" }}
              onClick={() => setShow(!show)}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        mt={2}
        bgGradient="linear(to-r, blue.400, blue.600)"
        color="white"
        borderRadius="xl"
        py={6}
        fontSize="sm"
        fontWeight="bold"
        shadow="md"
        _hover={{
          bgGradient: "linear(to-r, blue.500, blue.700)",
          transform: "translateY(-1px)",
          shadow: "lg",
        }}
        _active={{ transform: "translateY(0)" }}
        onClick={submitHandler}
        isLoading={loading}
        transition="all 0.2s"
      >
        Sign In
      </Button>

      <Button
        variant="outline"
        borderColor="gray.200"
        color="blue.500"
        borderRadius="xl"
        py={6}
        fontSize="sm"
        fontWeight="bold"
        _hover={{ bg: "blue.50", borderColor: "blue.100" }}
        onClick={handleGuestLogin}
        isLoading={loading}
        transition="all 0.2s"
      >
        Login as Guest
      </Button>

      <Box display="flex" alignItems="center" w="100%" my={2}>
        <Box flex="1" h="1px" bg="gray.200" />
        <Text
          mx={3}
          fontSize="2xs"
          color="gray.400"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Or continue with
        </Text>
        <Box flex="1" h="1px" bg="gray.200" />
      </Box>

      <Box w="100%">
        <FirebaseLogin />
      </Box>
    </VStack>
  );
};

export default Login;
