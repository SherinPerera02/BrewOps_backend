import { body, validationResult } from "express-validator";

// Validation middleware to handle errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "manager", "operator"])
      .withMessage("Role must be admin, manager, or operator"),
  ],

  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

// Supplier validation rules
const supplierValidation = {
  create: [
    body("name")
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage("Supplier name must be between 5-20 characters"),
    body("contact_number")
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage("Contact number must be exactly 10 digits"),
    body("nic_number")
      .matches(/^(\d{9}[vVxX]|\d{12})$/)
      .withMessage("NIC must be 9 digits + V/X or 12 digits"),
    body("address")
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage("Address must be between 10-100 characters"),
    body("bank_account_number")
      .isLength({ min: 6, max: 20 })
      .isNumeric()
      .withMessage("Bank account number must be 6-20 digits"),
    body("bank_name").trim().notEmpty().withMessage("Bank name is required"),
    body("rate")
      .isFloat({ min: 1 })
      .withMessage("Rate must be a positive number greater than 0"),
  ],

  update: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage("Supplier name must be between 5-20 characters"),
    body("contact_number")
      .optional()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage("Contact number must be exactly 10 digits"),
    body("nic_number")
      .optional()
      .matches(/^(\d{9}[vVxX]|\d{12})$/)
      .withMessage("NIC must be 9 digits + V/X or 12 digits"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 10, max: 100 })
      .withMessage("Address must be between 10-100 characters"),
    body("bank_account_number")
      .optional()
      .isLength({ min: 6, max: 20 })
      .isNumeric()
      .withMessage("Bank account number must be 6-20 digits"),
    body("bank_name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Bank name is required"),
    body("rate")
      .optional()
      .isFloat({ min: 1 })
      .withMessage("Rate must be a positive number greater than 0"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("is_active must be a boolean"),
  ],
};

// Payment validation rules
const paymentValidation = {
  monthly: [
    body("supplier_id")
      .isInt({ min: 1 })
      .withMessage("Valid supplier ID is required"),
    body("month")
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("Month must be in YYYY-MM format"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("payment_method")
      .optional()
      .isIn(["Cash", "Bank Transfer", "Cheque"])
      .withMessage("Invalid payment method"),
  ],

  spotCash: [
    body("supplier_id")
      .isInt({ min: 1 })
      .withMessage("Valid supplier ID is required"),
    body("quantity")
      .isFloat({ min: 0 })
      .withMessage("Quantity must be a positive number"),
    body("rate_per_kg")
      .isFloat({ min: 0 })
      .withMessage("Rate per kg must be a positive number"),
    body("payment_method")
      .optional()
      .isIn(["Cash", "Bank Transfer", "Cheque"])
      .withMessage("Invalid payment method"),
  ],
};

// Delivery validation rules
const deliveryValidation = {
  create: [
    body("supplier_id")
      .isInt({ min: 1 })
      .withMessage("Valid supplier ID is required"),
    body("quantity")
      .isFloat({ min: 0 })
      .withMessage("Quantity must be a positive number"),
    body("quality_score")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Quality score must be between 0-100"),
    body("rate_per_kg")
      .isFloat({ min: 0 })
      .withMessage("Rate per kg must be a positive number"),
  ],

  update: [
    body("quantity")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Quantity must be a positive number"),
    body("quality_score")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Quality score must be between 0-100"),
    body("rate_per_kg")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Rate per kg must be a positive number"),
  ],
};

export {
  handleValidation,
  userValidation,
  supplierValidation,
  paymentValidation,
  deliveryValidation,
};
