import express from "express";
import {
  registerUser,
  authUser,
  allUsers,
  googleLogin,
} from "../controllers/userControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.post("/google-login", googleLogin);
export default router;
