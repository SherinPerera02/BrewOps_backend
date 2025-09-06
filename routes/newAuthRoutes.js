import express from "express";
import authController from "../controllers/newAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
router.post("/register", authController.register);

// @route   POST /api/auth/login
router.post("/login", authController.login);

// @route   GET /api/auth/me
router.get("/me", protect, authController.getMe);

export default router;
