// Login.jsx
import React from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { Button, useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import api from "../../config/axios";
import GoogleButton from "react-google-button";

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
    <GoogleButton style={{ width: "100%" }} onClick={handleGoogleLogin}>
      Login with Google
    </GoogleButton>
  );
};

export default FirebaseLogin;
