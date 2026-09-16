import { Router } from "express";

import {
  getCurrentUser,
  getUserByUsername,
  updateProfile,
  updateAvatar,
  removeAvatar,
  followUser,
  unfollowUser,
} from "../controllers/user.controllers";
import { authenticateUser } from "../middleware/auth.middleware";
import { uploadAvatar } from "../middleware/upload.middleware";

const router = Router();

router.get("/me", authenticateUser, getCurrentUser);
router.get("/:username", getUserByUsername);
router.patch("/me", authenticateUser, updateProfile);
router.patch(
  "/me/avatar",
  authenticateUser,
  uploadAvatar.single("avatar"),
  updateAvatar,
);
router.delete("/me/avatar", authenticateUser, removeAvatar);
router.post("/:username/follow", authenticateUser, followUser);
router.delete("/:username/follow", authenticateUser, unfollowUser);

export default router;
