import { InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import api from "../../config/axios";

const Signup = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();

  //Handle Profile Pic Upload to cloudinary to Database
  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        // Toast is just a pop up
        title: "Please Select an Image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData(); //Image is uploaded to cloudinary and then to database.
      data.append("file", pics);
      data.append("upload_preset", "chat-app"); // upload-preset name from cloudinary
      data.append("cloud_name", "kirtan011"); // cloud name from cloudinary
      axios
        .post("https://api.cloudinary.com/v1_1/kirtan011/image/upload", data)
        .then((response) => {
          console.log("Cloudinary response:", response);
          setPic(response.data.url.toString());
          setLoading(false);
          toast({
            title: "Image uploaded successfully!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        })
        .catch((error) => {
          console.log("Cloudinary error:", error);
          setLoading(false);
        });
    }
  };

  //Handle Sign Up Submit
  const submitHandler = async () => {
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all the fields!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    // Profile picture is optional. If not uploaded, backend uses default avatar.

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await api.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");
    } catch (err) {
      toast({
        title: "Error occurred!",
        description: err.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    setLoading(false);
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <FormControl id="first-name" isRequired>
        <FormLabel
          fontSize="xs"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1.5}
        >
          Name
        </FormLabel>
        <Input
          name="name"
          placeholder="John Doe"
          onChange={(e) => setName(e.target.value)}
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

      <FormControl id="Signup-email" isRequired>
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
          placeholder="your.email@example.com"
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

      <FormControl id="Signup-password" isRequired>
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

      <FormControl id="Signup-confirm-password" isRequired>
        <FormLabel
          fontSize="xs"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1.5}
        >
          Confirm Password
        </FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            onChange={(e) => setConfirmPassword(e.target.value)}
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

      <FormControl id="pic">
        <FormLabel
          fontSize="xs"
          fontWeight="700"
          color="gray.500"
          textTransform="uppercase"
          letterSpacing="wider"
          mb={1.5}
        >
          Upload Profile Picture (Optional)
        </FormLabel>
        <Box
          border="2px dashed"
          borderColor="gray.200"
          borderRadius="xl"
          p={3}
          textAlign="center"
          bg="gray.50"
          cursor="pointer"
          position="relative"
          _hover={{ borderColor: "blue.400", bg: "blue.50" }}
          transition="all 0.2s"
        >
          <Input
            type="file"
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            opacity={0}
            cursor="pointer"
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
          <Text fontSize="xs" fontWeight="bold" color="gray.500">
            {pic ? "✅ Picture Selected" : "📁 Choose image file"}
          </Text>
        </Box>
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
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
