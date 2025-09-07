import express from "express";
import deliveryController from "../controllers/deliveryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  deliveryValidation,
  handleValidation,
} from "../middleware/validation.js";

const router = express.Router();

// @route   GET /api/deliveries/monthly-summary/:month
router.get(
  "/monthly-summary/:month",
  protect,
  deliveryController.getMonthlySummary
);

// @route   GET /api/deliveries/supplier/:supplierId
router.get(
  "/supplier/:supplierId",
  protect,
  deliveryController.getDeliveriesBySupplier
);

// @route   GET /api/deliveries
router.get("/", protect, deliveryController.getAllDeliveries);

// @route   GET /api/deliveries/:id
router.get("/:id", protect, deliveryController.getDelivery);

// @route   POST /api/deliveries
router.post(
  "/",
  protect,
  deliveryValidation.create,
  handleValidation,
  deliveryController.createDelivery
);

// @route   PUT /api/deliveries/:id
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  deliveryValidation.update,
  handleValidation,
  deliveryController.updateDelivery
);

// @route   DELETE /api/deliveries/:id
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deliveryController.deleteDelivery
);

export default router;
