import asyncHandler from "express-async-handler";
import User from "../Models/userModel.js";
import generateToken from "../config/generateToken.js";
import bcrypt from "bcrypt";

//Sign Up
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(201);
    throw new Error("Failed to Create the User");
  }
});

// LOGIN
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Enter all the fields");
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), // JWT token
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//Google-Login

const googleLogin = asyncHandler(async (req, res) => {
  const { name, email, pic, id } = req.body;

  console.log("Google Login Payload:", req.body);

  if (!email || !id) {
    res.status(400);
    throw new Error("Invalid Google login data — email or ID missing");
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      pic,
      googleId: id,
    });
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

//All Users:
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.searchedUser
    ? {
        $or: [
          { name: { $regex: req.query.searchedUser, $options: "i" } },
          { email: { $regex: req.query.searchedUser, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

export { registerUser, authUser, allUsers, googleLogin };
