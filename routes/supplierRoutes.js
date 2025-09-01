import express from "express";
import {
  getSupplierProfile,
  updateSupplierProfile,
  getSupplierStats,
  getSupplierById,
  createSupplierProfile,
  deleteSupplierProfile,
} from "../controllers/supplierController.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get supplier profile (current user)
router.get("/profile", getSupplierProfile);

// Update supplier profile (current user)
router.put("/profile", updateSupplierProfile);

// Get supplier statistics (current user)
router.get("/stats", getSupplierStats);

// Get supplier by ID (admin or manager use)
router.get("/:supplierId", getSupplierById);

// Create supplier profile (admin use)
router.post("/", createSupplierProfile);

// Delete supplier profile (admin use)
router.delete("/:supplierId", deleteSupplierProfile);

export default router;
