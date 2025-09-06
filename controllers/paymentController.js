import Payment from "../models/Payment.js";

const paymentController = {
  // @desc    Get all payments
  // @route   GET /api/payments
  // @access  Private
  getAllPayments: async (req, res) => {
    try {
      const payments = await Payment.findAll(req.query);

      res.json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching payments",
        error: error.message,
      });
    }
  },

  // @desc    Get payment statistics
  // @route   GET /api/payments/statistics
  // @access  Private
  getPaymentStatistics: async (req, res) => {
    try {
      const statistics = await Payment.getStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching statistics",
        error: error.message,
      });
    }
  },

  // @desc    Get single payment
  // @route   GET /api/payments/:id
  // @access  Private
  getPayment: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching payment",
        error: error.message,
      });
    }
  },

  // @desc    Process monthly payment
  // @route   POST /api/payments/monthly
  // @access  Private
  processMonthlyPayment: async (req, res) => {
    try {
      const payment = await Payment.createMonthlyPayment(req.body);

      res.status(201).json({
        success: true,
        message: "Monthly payment processed successfully",
        data: payment,
      });
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error processing monthly payment",
        error: error.message,
      });
    }
  },

  // @desc    Process spot cash payment
  // @route   POST /api/payments/spot-cash
  // @access  Private
  processSpotCashPayment: async (req, res) => {
    try {
      const payment = await Payment.createSpotCashPayment(req.body);

      res.status(201).json({
        success: true,
        message: `Spot cash payment of LKR ${payment.amount.toFixed(
          2
        )} processed successfully`,
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error processing spot cash payment",
        error: error.message,
      });
    }
  },

  // @desc    Update payment status
  // @route   PATCH /api/payments/:id/status
  // @access  Private
  updatePaymentStatus: async (req, res) => {
    try {
      const { status } = req.body;

      if (!["pending", "paid", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const updated = await Payment.updateStatus(req.params.id, status);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.json({
        success: true,
        message: "Payment status updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating payment status",
        error: error.message,
      });
    }
  },
};

export default paymentController;
