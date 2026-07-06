// Login.jsx
import React from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { Button, useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import api from "../../config/axios";

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "8px" }}
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.93 5.482 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.32 0 2.507.454 3.44 1.346l2.582-2.58C13.463.896 11.427 0 9 0 5.482 0 2.438 2.07 1.002 5.039l3.007 2.332C4.718 5.184 6.702 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const FirebaseLogin = () => {
  const history = useHistory();
  const toast = useToast();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const { data } = await api.post("/api/user/google-login", {
        name: user.displayName,
        email: user.email,
        pic: user.photoURL,
        id: user.uid,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      toast({
        title: "Google Login Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      history.push("/chats");
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google Login Failed",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Button
      w="100%"
      py={6}
      variant="outline"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      color="gray.600"
      fontSize="sm"
      fontWeight="bold"
      leftIcon={<GoogleIcon />}
      _hover={{ bg: "gray.50", borderColor: "gray.300" }}
      _active={{ bg: "gray.100" }}
      onClick={handleGoogleLogin}
      transition="all 0.2s"
    >
      Sign in with Google
    </Button>
  );
};

export default FirebaseLogin;
