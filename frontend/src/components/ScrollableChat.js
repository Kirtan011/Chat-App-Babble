import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../components/config/ChatLogics";
import { ChatState } from "../context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import { motion } from "framer-motion";
import { useEffect } from "react";

const MotionDiv = motion.div;

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // Add CSS dynamically (so no need for a separate file)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .scrollable-chat {
        background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #e3f2fd 100%);
        backdrop-filter: blur(12px);
        min-height: 100%;
        padding: 12px;
        border-radius: 18px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
      }

      .scrollable-chat::-webkit-scrollbar {
        width: 6px;
      }

      .scrollable-chat::-webkit-scrollbar-thumb {
        background-color: rgba(160, 174, 192, 0.6);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <ScrollableFeed className="scrollable-chat">
      {messages &&
        messages.map((m, i) => {
          const isUserMessage = m.sender._id === user._id;

          return (
            <MotionDiv
              key={m._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex",
                alignItems: "flex-end",
                marginBottom: isSameUser(messages, m, i, user._id) ? 4 : 12,
                justifyContent: isUserMessage ? "flex-end" : "flex-start",
                paddingInline: 8,
              }}
            >
              {/* Avatar for sender */}
              {!isUserMessage &&
                (isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <ProfileModal user={m.sender}>
                    <Tooltip
                      label={m.sender.name}
                      placement="bottom-start"
                      hasArrow
                    >
                      <Avatar
                        mt="auto"
                        mr={2}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                        boxShadow="md"
                      />
                    </Tooltip>
                  </ProfileModal>
                )}

              {/* Message bubble */}
              <span
                style={{
                  background: isUserMessage
                    ? "linear-gradient(135deg, #bee3f8 0%, #63b3ed 100%)"
                    : "linear-gradient(135deg, #c6f6d5 0%, #68d391 100%)",
                  color: "#1a202c",
                  borderRadius: isUserMessage
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding: "10px 14px",
                  maxWidth: "70%",
                  fontSize: "15px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                  wordBreak: "break-word",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  backdropFilter: "blur(4px)",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                {m.content}
              </span>
            </MotionDiv>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
