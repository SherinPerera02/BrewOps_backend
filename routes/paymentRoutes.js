import express from "express";
import paymentController from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  paymentValidation,
  handleValidation,
} from "../middleware/validation.js";

const router = express.Router();

// @route   GET /api/payments/statistics
router.get("/statistics", protect, paymentController.getPaymentStatistics);

// @route   GET /api/payments
router.get("/", protect, paymentController.getAllPayments);

// @route   GET /api/payments/:id
router.get("/:id", protect, paymentController.getPayment);

// @route   POST /api/payments/monthly
router.post(
  "/monthly",
  protect,
  authorize("admin", "manager"),
  paymentValidation.monthly,
  handleValidation,
  paymentController.processMonthlyPayment
);

// @route   POST /api/payments/spot-cash
router.post(
  "/spot-cash",
  protect,
  paymentValidation.spotCash,
  handleValidation,
  paymentController.processSpotCashPayment
);

// @route   PATCH /api/payments/:id/status
router.patch(
  "/:id/status",
  protect,
  authorize("admin", "manager"),
  paymentController.updatePaymentStatus
);

export default router;
