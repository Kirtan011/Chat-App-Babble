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

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const isUserMessage = m.sender._id === user._id;

          return (
            <div
              key={m._id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: isSameUser(messages, m, i, user._id) ? 4 : 10,
                marginLeft: isUserMessage ? "auto" : 0,
                justifyContent: isUserMessage ? "flex-end" : "flex-start",
                paddingLeft: isUserMessage ? 0 : 8,
                paddingRight: isUserMessage ? 8 : 0,
              }}
            >
              {/* Avatar and Tooltip */}
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
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  </ProfileModal>
                )}

              {/* Message Bubble */}
              <span
                style={{
                  backgroundColor: isUserMessage ? "#BEE3F8" : "#B9F5D0",
                  color: "#2D3748",
                  borderRadius: isUserMessage
                    ? "15px 15px 1px 15px"
                    : "15px 15px 15px 1px",
                  padding: "8px 14px",
                  maxWidth: "65%",
                  fontSize: "15px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  wordBreak: "break-word",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                }}
              >
                {m.content}
              </span>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
