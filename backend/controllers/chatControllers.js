import asyncHandler from "express-async-handler";
import Chat from "../Models/chatModel.js";
import User from "../Models/userModel.js";

// Create and Access Chats
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400).json({ message: "UserId param missing" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email pic",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
  }
});

// Fetch User Chats
const fetchChat = asyncHandler(async (req, res) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        //populates latestMessage and its sender field
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name pic email",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).send(results);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Create Group Chat
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  let users;
  try {
    users = req.body.users;
  } catch (err) {
    return res.status(400).send({ message: "Invalid users format" });
  }

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to make a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Rename Group
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChatName = await Chat.findByIdAndUpdate(
    chatId,
    { chatName }, // same as {chatName:chatName}// {(oldName): (UpdatedName)}
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChatName) {
    return res.status(404).json({ message: "Chat not found" });
  }
  res.status(200).json(updatedChatName);
});

//Add User to Group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const addUser = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } }, //pushes the new user in users array   (adding of user)
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addUser) {
    return res.status(404).json({ message: "Chat not found" });
  }
  res.status(200).json(addUser);
});

//Remove User from Group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  // Remove user
  chat.users = chat.users.filter((u) => u.toString() !== userId);

  // Reassign admin if removed user was admin
  if (chat.groupAdmin?.toString() === userId) {
    chat.groupAdmin = chat.users.length > 0 ? chat.users[0] : null;
  }

  const updatedChat = await chat.save();
  const populatedChat = await Chat.findById(updatedChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(populatedChat);
});

export {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
