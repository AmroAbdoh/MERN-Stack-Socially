import { Router } from "express";

import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.get("/posts/:postId/comments", authenticateUser, getPostComments);
router.post("/posts/:postId/comments", authenticateUser, createComment);
router.patch("/comments/:id", authenticateUser, updateComment);
router.delete("/comments/:id", authenticateUser, deleteComment);

export default router;
