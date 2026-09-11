import { Router } from "express";

import { searchPosts, searchUsers } from "../controllers/search.controller";

const router = Router();

router.get("/user", searchUsers);
router.get("/post", searchPosts);

export default router;
