import { Router } from "express";

import {
  register,
  checkRegistrationAvailability,
  login,
  forgotPassword,
  verifySecurityAnswer,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/check-availability", checkRegistrationAvailability);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-security-answer", verifySecurityAnswer);
router.post("/reset-password", resetPassword);

export default router;
