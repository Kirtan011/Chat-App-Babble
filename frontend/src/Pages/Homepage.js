import { useLayoutEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login.js";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";

const Homepage = () => {
  const history = useHistory();

  useLayoutEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      history.push("/chats");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxW="lg" centerContent display="flex" justifyContent="center" minH="100vh" p={4}>
      <Box
        bg="rgba(255, 255, 255, 0.75)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.4)"
        w="100%"
        p={{ base: 6, md: 10 }}
        borderRadius="3xl"
        boxShadow="0 10px 40px 0 rgba(0, 0, 0, 0.1)"
        display="flex"
        flexDir="column"
        alignItems="center"
        transition="all 0.3s ease"
      >
        <Text
          fontSize="4xl"
          fontWeight="800"
          fontFamily="Baloo 2"
          letterSpacing="wide"
          bgClip="text"
          bgGradient="linear(to-r, teal.400, blue.500)"
          mb={8}
        >
          BABBLE
        </Text>

        <Tabs variant="unstyled" w="100%">
          <TabList
            display="flex"
            bg="gray.100"
            p={1.5}
            borderRadius="full"
            mb={8}
            w="100%"
            border="1px solid"
            borderColor="gray.200"
          >
            <Tab
              w="50%"
              borderRadius="full"
              py={2.5}
              fontSize="sm"
              fontWeight="600"
              color="gray.500"
              _selected={{
                bg: "white",
                color: "blue.600",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
              _hover={{ color: "gray.700" }}
              transition="all 0.2s ease"
            >
              Login
            </Tab>
            <Tab
              w="50%"
              borderRadius="full"
              py={2.5}
              fontSize="sm"
              fontWeight="600"
              color="gray.500"
              _selected={{
                bg: "white",
                color: "blue.600",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
              _hover={{ color: "gray.700" }}
              transition="all 0.2s ease"
            >
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <Login />
            </TabPanel>
            <TabPanel p={0}>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Homepage;
