import { Router } from "express";

import {
  createPost,
  getPosts,
  getMyPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} from "../controllers/post.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { uploadPostImages } from "../middleware/upload.middleware";

const router = Router();

router.get("/", getPosts);
router.get("/me", authenticateUser, getMyPosts);
router.get("/user/:username", getUserPosts);
router.get("/:id", getPost);
router.post(
  "/",
  authenticateUser,
  uploadPostImages.array("images", 6),
  createPost,
);
router.patch("/:id", authenticateUser, updatePost);
router.delete("/:id", authenticateUser, deletePost);
router.post("/:id/like", authenticateUser, likePost);
router.delete("/:id/like", authenticateUser, unlikePost);

export default router;
