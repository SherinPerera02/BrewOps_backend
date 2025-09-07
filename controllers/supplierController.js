import Supplier from "../models/Supplier.js";

const supplierController = {
  // @desc    Get all suppliers
  // @route   GET /api/suppliers
  // @access  Private
  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.findAll();
      res.json({
        success: true,
        count: suppliers.length,
        data: suppliers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching suppliers",
        error: error.message,
      });
    }
  },

  // @desc    Get active suppliers
  // @route   GET /api/suppliers/active
  // @access  Private
  getActiveSuppliers: async (req, res) => {
    try {
      const suppliers = await Supplier.findActive();
      res.json({
        success: true,
        count: suppliers.length,
        data: suppliers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching active suppliers",
        error: error.message,
      });
    }
  },

  // @desc    Get single supplier
  // @route   GET /api/suppliers/:id
  // @access  Private
  getSupplier: async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id);

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching supplier",
        error: error.message,
      });
    }
  },

  // @desc    Create supplier
  // @route   POST /api/suppliers
  // @access  Private
  createSupplier: async (req, res) => {
    try {
      const supplier = await Supplier.create(req.body);

      res.status(201).json({
        success: true,
        message: "Supplier created successfully",
        data: supplier,
      });
    } catch (error) {
      // Handle specific database constraint errors
      if (error.message.includes("NIC number already exists")) {
        return res.status(400).json({
          success: false,
          message: "A supplier with this NIC number already exists",
        });
      }
      if (error.message.includes("Supplier ID already exists")) {
        return res.status(400).json({
          success: false,
          message: "Supplier ID already exists. Please try again.",
        });
      }
      if (error.message.includes("Duplicate entry")) {
        return res.status(400).json({
          success: false,
          message: "A supplier with these details already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating supplier",
        error: error.message,
      });
    }
  },

  // @desc    Update supplier
  // @route   PUT /api/suppliers/:id
  // @access  Private
  updateSupplier: async (req, res) => {
    try {
      const updated = await Supplier.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      res.json({
        success: true,
        message: "Supplier updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating supplier",
        error: error.message,
      });
    }
  },

  // @desc    Delete supplier (soft delete)
  // @route   DELETE /api/suppliers/:id
  // @access  Private
  deleteSupplier: async (req, res) => {
    try {
      const deleted = await Supplier.softDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }

      res.json({
        success: true,
        message: "Supplier deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting supplier",
        error: error.message,
      });
    }
  },

  // @desc    Reactivate supplier
  // @route   PATCH /api/suppliers/:id/reactivate
  // @access  Private
  reactivateSupplier: async (req, res) => {
    try {
      const { id } = req.params;
      const success = await Supplier.update(id, { is_active: true });

      if (success) {
        res.json({
          success: true,
          message: "Supplier reactivated successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error reactivating supplier",
        error: error.message,
      });
    }
  },
};

export default supplierController;
