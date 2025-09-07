import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

const authController = {
  // @desc    Register user
  // @route   POST /api/auth/register
  // @access  Public
  register: async (req, res) => {
    try {
      const { name, email, password, role, phone, employee_id } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        employee_id,
      });
      const jwtToken = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          employee_id: user.employee_id,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
    }
  },

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Compare password with password_hash from database
      const isMatch = await User.comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const jwtToken = generateToken(user.id);

      res.json({
        success: true,
        message: "Login successful",
        jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          employee_id: user.employee_id,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
    }
  },

  // @desc    Get current user
  // @route   GET /api/auth/me
  // @access  Private
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          employee_id: user.employee_id,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user data",
        error: error.message,
      });
    }
  },
};

export default authController;
