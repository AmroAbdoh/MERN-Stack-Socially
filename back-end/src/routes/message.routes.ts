import { Router } from "express";

import {
  sendMessage,
  getConversation,
  getUnreadMessageCount,
  getMessageContacts,
} from "../controllers/message.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateUser);
router.get("/contacts", getMessageContacts);
router.get("/unread-count", getUnreadMessageCount);
router.post("/send", sendMessage);
router.get("/conversation/:userId", getConversation);

export default router;
