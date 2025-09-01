import express from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  generateInventoryIdEndpoint,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Inventory ID generation route (should be before /:id route)
router.get("/generate-inventory-id", generateInventoryIdEndpoint);

// CRUD Routes
router.post("/", createInventory);
router.get("/", getInventories);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;
