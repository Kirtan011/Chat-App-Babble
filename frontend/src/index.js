import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./context/ChatProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
