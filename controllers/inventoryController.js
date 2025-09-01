import InventoryModel from "../models/inventoryModel.js";

// Auto-Generated Inventory ID Function
/**
 * Generate inventory ID format: INV-YYYYMMDD-HHMM
 * @returns {string} Auto-generated inventory ID
 */
export const generateInventoryId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `INV-${year}${month}${day}-${hours}${minutes}`;
};

// Create inventory
export const createInventory = async (req, res) => {
  try {
    const { quantity } = req.body;

    // Validate required fields
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    //  Always auto-generate inventory ID
    const finalInventoryId = generateInventoryId();
    console.log(`🆔 Auto-generated inventory ID: ${finalInventoryId}`);

    const newInventory = await InventoryModel.create({
      inventoryid: finalInventoryId,
      quantity,
    });

    res.status(201).json({
      success: true,
      data: newInventory,
      message: `Inventory created with auto-generated inventory ID: ${finalInventoryId}`,
      inventoryIdGenerated: true,
    });
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all inventories
export const getInventories = async (req, res) => {
  try {
    const inventories = await InventoryModel.findAll();
    res.status(200).json({
      success: true,
      data: inventories,
      count: inventories.length,
      message: "Inventories fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get inventory by ID
export const getInventoryById = async (req, res) => {
  try {
    const inventory = await InventoryModel.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
      message: "Inventory fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching inventory by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update inventory
export const updateInventory = async (req, res) => {
  try {
    const { inventoryid, quantity } = req.body;

    // Validate required fields
    if (!inventoryid || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Inventory ID and quantity are required",
      });
    }

    const updated = await InventoryModel.updateById(req.params.id, {
      inventoryid,
      quantity,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete inventory
export const deleteInventory = async (req, res) => {
  try {
    const deleted = await InventoryModel.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Generate Inventory ID endpoint
export const generateInventoryIdEndpoint = async (req, res) => {
  try {
    // Always generate standard INV-YYYYMMDD-HHMMSS-timestamp format
    const inventoryId = generateInventoryId();

    res.status(200).json({
      success: true,
      data: {
        inventoryId,
        format: "Standard INV-YYYYMMDD-HHMMSS-timestamp",
        timestamp: new Date().toISOString(),
        examples: {
          current: inventoryId,
          another: generateInventoryId(),
        },
      },
      message: "Inventory ID generated successfully",
    });
  } catch (error) {
    console.error("Error generating inventory ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
