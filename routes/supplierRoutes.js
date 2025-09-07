import express from "express";
import supplierController from "../controllers/supplierController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  supplierValidation,
  handleValidation,
} from "../middleware/validation.js";

const router = express.Router();

// @route   GET /api/suppliers/active
router.get("/active", protect, supplierController.getActiveSuppliers);

// @route   GET /api/suppliers
router.get("/", protect, supplierController.getAllSuppliers);

// @route   GET /api/suppliers/:id
router.get("/:id", protect, supplierController.getSupplier);

// @route   POST /api/suppliers
router.post(
  "/",
  protect,
  authorize("admin", "manager", "staff"),
  supplierValidation.create,
  handleValidation,
  supplierController.createSupplier
);

// @route   PUT /api/suppliers/:id
router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "staff"),
  supplierValidation.update,
  handleValidation,
  supplierController.updateSupplier
);

// @route   DELETE /api/suppliers/:id
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager", "staff"),
  supplierController.deleteSupplier
);

// @route   PATCH /api/suppliers/:id/reactivate
router.patch(
  "/:id/reactivate",
  protect,
  authorize("admin", "manager", "staff"),
  supplierController.reactivateSupplier
);

export default router;
