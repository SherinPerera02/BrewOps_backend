import Delivery from "../models/Delivery.js";

const deliveryController = {
  // @desc    Get all deliveries
  // @route   GET /api/deliveries
  // @access  Private
  getAllDeliveries: async (req, res) => {
    try {
      const deliveries = await Delivery.findAll(req.query);

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching deliveries",
        error: error.message,
      });
    }
  },

  // @desc    Get single delivery
  // @route   GET /api/deliveries/:id
  // @access  Private
  getDelivery: async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.id);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: "Delivery not found",
        });
      }

      res.json({
        success: true,
        data: delivery,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching delivery",
        error: error.message,
      });
    }
  },

  // @desc    Get deliveries by supplier ID
  // @route   GET /api/deliveries/supplier/:supplierId
  // @access  Private
  getDeliveriesBySupplier: async (req, res) => {
    try {
      const deliveries = await Delivery.findBySupplier(req.params.supplierId);

      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching supplier deliveries",
        error: error.message,
      });
    }
  },

  // @desc    Get monthly summary
  // @route   GET /api/deliveries/monthly-summary/:month
  // @access  Private
  getMonthlySummary: async (req, res) => {
    try {
      const month = req.params.month; // Format: YYYY-MM
      const summary = await Delivery.getMonthlySummary(month);

      res.json({
        success: true,
        count: summary.length,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching monthly summary",
        error: error.message,
      });
    }
  },

  // @desc    Record delivery
  // @route   POST /api/deliveries
  // @access  Private
  createDelivery: async (req, res) => {
    try {
      const delivery = await Delivery.create(req.body);

      res.status(201).json({
        success: true,
        message: "Delivery recorded successfully",
        data: delivery,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error recording delivery",
        error: error.message,
      });
    }
  },

  // @desc    Update delivery
  // @route   PUT /api/deliveries/:id
  // @access  Private
  updateDelivery: async (req, res) => {
    try {
      const updated = await Delivery.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Delivery not found",
        });
      }

      res.json({
        success: true,
        message: "Delivery updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating delivery",
        error: error.message,
      });
    }
  },

  // @desc    Delete delivery
  // @route   DELETE /api/deliveries/:id
  // @access  Private
  deleteDelivery: async (req, res) => {
    try {
      const deleted = await Delivery.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Delivery not found",
        });
      }

      res.json({
        success: true,
        message: "Delivery deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting delivery",
        error: error.message,
      });
    }
  },
};

export default deliveryController;
