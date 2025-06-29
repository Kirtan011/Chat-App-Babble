import { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useHistory } from "react-router-dom";

const Chatpage = () => {
  const { user } = ChatState();
  const history = useHistory();
  const [fetchAgain, setFetchAgain] = useState(false);

  useEffect(() => {
    if (!user) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        // manually set user in context if needed
        // you can expose setUser in ChatState to do this
      } else {
        history.push("/");
      }
    }
  }, [user, history]);

  if (!user) return null; // ❗ Avoid rendering prematurely

  return (
    <div style={{ width: "100%" }}>
      <SideDrawer />
      <Box
        display="flex"
        flexDir={{ base: "column", md: "row" }}
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        <MyChats fetchAgain={fetchAgain} />
        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </Box>
    </div>
  );
};

export default Chatpage;
