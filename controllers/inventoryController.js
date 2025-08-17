import InventoryModel from "../models/inventoryModel.js";

// Create inventory
export const createInventory = async (req, res) => {
  try {
    const { batchid, inventorynumber, quantity } = req.body;

    if (!batchid || !inventorynumber || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newInventory = await InventoryModel.create({
      batchid,
      inventorynumber,
      quantity,
    });

    res.status(201).json(newInventory);
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all inventories
export const getInventories = async (req, res) => {
  try {
    const inventories = await InventoryModel.findAll();
    res.status(200).json(inventories);
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get inventory by ID
export const getInventoryById = async (req, res) => {
  try {
    const inventory = await InventoryModel.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update inventory
export const updateInventory = async (req, res) => {
  try {
    const { batchid, inventorynumber, quantity } = req.body;
    const updated = await InventoryModel.updateById(req.params.id, {
      batchid,
      inventorynumber,
      quantity,
    });

    if (!updated) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete inventory
export const deleteInventory = async (req, res) => {
  try {
    const deleted = await InventoryModel.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
