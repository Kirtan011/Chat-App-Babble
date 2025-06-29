import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true, // Remove extra spaces from the chat name
    },
    isGroupChat: {
      type: Boolean,
      default: false, // Default is a one-on-one chat, not group
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId, // ID of a user from User model
        ref: "User", // Reference to User model
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId, // ID of the latest message
      ref: "Message", // Reference to Message model
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId, // ID of the group admin user
      ref: "User", // Reference to User model
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
