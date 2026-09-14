import { Router } from "express";

import {
  sendMessage,
  getConversation,
} from "../controllers/message.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateUser);
router.post("/send", sendMessage);
router.get("/conversation/:userId", getConversation);

export default router;
