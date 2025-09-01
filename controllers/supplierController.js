import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as SupplierModel from "../models/supplierModel.js";

// Get supplier profile
export const getSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const supplier = await SupplierModel.findSupplierByUserId(userId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    // Remove sensitive information
    const { password_hash, ...supplierData } = supplier;

    res.status(200).json({
      success: true,
      data: supplierData,
      message: "Supplier profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get supplier profile by supplier ID
export const getSupplierById = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const supplier = await SupplierModel.findSupplierById(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      data: supplier,
      message: "Supplier fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update supplier profile
export const updateSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const {
      name,
      email,
      contactNumber,
      address,
      city,
      postalCode,
      country,
      bankAccountNumber,
      bankName,
      branchCode,
      password,
      confirmPassword,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !contactNumber ||
      !address ||
      !city ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "All profile fields are required",
      });
    }

    // Validate password confirmation if password is provided
    if (password && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Validate password strength if provided
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Get current supplier profile
    const currentSupplier = await SupplierModel.findSupplierByUserId(userId);
    if (!currentSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    // Prepare user update data
    const userUpdateData = {
      name,
      email,
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      userUpdateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Prepare supplier update data
    const supplierUpdateData = {
      name,
      contact_number: contactNumber,
      address,
      city,
      postal_code: postalCode,
      country,
      bank_account_number: bankAccountNumber,
      bank_name: bankName,
      branch_code: branchCode,
    };

    // Update user profile
    await SupplierModel.updateUserProfile(userId, userUpdateData);

    // Update supplier profile
    await SupplierModel.updateSupplierProfile(
      currentSupplier.supplier_id,
      supplierUpdateData
    );

    // Fetch updated supplier profile
    const updatedSupplier = await SupplierModel.findSupplierByUserId(userId);
    const { password_hash, ...responseData } = updatedSupplier;

    res.status(200).json({
      success: true,
      data: responseData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating supplier profile:", error);

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Email address is already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get supplier statistics
export const getSupplierStats = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const supplier = await SupplierModel.findSupplierByUserId(userId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    const stats = await SupplierModel.getSupplierStats(supplier.supplier_id);

    res.status(200).json({
      success: true,
      data: {
        monthlyDelivery: `${stats.monthlyDelivery} kg`,
        qualityScore: `${Math.round(stats.qualityScore)}%`,
        monthlyRevenue: `Rs. ${stats.monthlyRevenue.toLocaleString()}`,
        deliveryRate: `${Math.round(stats.deliveryRate)}%`,
      },
      message: "Supplier statistics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching supplier statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create supplier profile (for admin use or registration)
export const createSupplierProfile = async (req, res) => {
  try {
    const {
      supplierId,
      userId,
      name,
      contactNumber,
      address,
      city,
      postalCode,
      country,
      bankAccountNumber,
      bankName,
      branchCode,
    } = req.body;

    // Validate required fields
    if (!supplierId || !userId || !name || !contactNumber || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check if supplier already exists
    const existingSupplier = await SupplierModel.findSupplierById(supplierId);
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier ID already exists",
      });
    }

    const supplierData = {
      supplier_id: supplierId,
      user_id: userId,
      name,
      contact_number: contactNumber,
      address,
      city,
      postal_code: postalCode,
      country,
      bank_account_number: bankAccountNumber,
      bank_name: bankName,
      branch_code: branchCode,
    };

    await SupplierModel.createSupplier(supplierData);

    res.status(201).json({
      success: true,
      message: "Supplier profile created successfully",
      data: { supplier_id: supplierId },
    });
  } catch (error) {
    console.error("Error creating supplier profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete supplier profile
export const deleteSupplierProfile = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await SupplierModel.findSupplierById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await SupplierModel.deleteSupplier(supplierId);

    res.status(200).json({
      success: true,
      message: "Supplier profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
