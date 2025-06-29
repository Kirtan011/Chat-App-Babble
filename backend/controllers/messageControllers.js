import asyncHandler from "express-async-handler";
import Message from "../Models/messageModel.js";
import Chat from "../Models/chatModel.js";
import User from "../Models/userModel.js";

//Sending a new message
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate([
      { path: "sender", select: "name pic" },
      { path: "chat", populate: { path: "users", select: "name pic email" } },
    ]);

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//All Messages in Chatbox
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email pic")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { sendMessage, allMessages };
