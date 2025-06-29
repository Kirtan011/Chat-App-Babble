import { InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import axios from "axios";

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

    if (!pic) {
      toast({
        title: "Please wait for the image to upload.",
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
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
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
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel> Name </FormLabel>
        <Input
          name="name" //for autofill feature
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      <FormControl id="Signup-email" isRequired>
        <FormLabel mt="2"> Email </FormLabel>
        <Input
          name="email" //for autofill
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="Signup-password" isRequired>
        <FormLabel mt="2"> Password </FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Set Your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.5rem" size="sm" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="Signup-confirm-password" isRequired>
        <FormLabel mt="2"> Confirm Password </FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Your Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.5rem" size="sm" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic" isRequired>
        <FormLabel mt="2"> Upload Your Picture </FormLabel>
        <Input
          type="file"
          p={1}
          accept="image/*"
          placeholder=""
          onChange={(e) => postDetails(e.target.files[0])} //accept 1st image if multiple image selected
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        mt="15px"
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
