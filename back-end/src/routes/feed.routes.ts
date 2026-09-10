import { Router } from "express";

import { getFeed } from "../controllers/feed.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateUser, getFeed);

export default router;
