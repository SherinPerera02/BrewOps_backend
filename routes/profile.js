import express from "express";
import connectDB from "../config/db.js";
const router = express.Router();

// Helper to fetch user from DB
async function getUserFromDB(userId) {
  const db = await connectDB();
  const [rows] = await db.execute(
    "SELECT id, name, email, role, phone, employee_id, created_at FROM users WHERE id = ?",
    [userId]
  );
  return rows[0] || null;
}

// GET /api/profile - Get current user profile from MySQL
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const user = await getUserFromDB(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

// GET /api/profile/basic - Get basic profile info
router.get("/basic", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const user = await getUserFromDB(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const basicInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      employee_id: user.employee_id,
      created_at: user.created_at,
    };
    res.json({ success: true, data: basicInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

// PUT /api/profile - Update user profile
router.put("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { name, email, phone, address, preferences } = req.body;

    // Update user data
    const db = await connectDB();
    await db.execute(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, userId]
    );

    // Update preferences if provided
    if (preferences) {
      await db.execute("UPDATE user_preferences SET ? WHERE user_id = ?", [
        preferences,
        userId,
      ]);
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

// POST /api/profile/change-password - Change user password
router.post("/change-password", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All password fields are required",
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "New passwords do not match",
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long",
      });
    }

    // Check for password complexity (optional)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    const db = await connectDB();
    // In real implementation:
    // 1. Verify current password against database
    // 2. Hash new password before storing
    // 3. Update password in database

    // Simulate password verification and update
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    // if (!isCurrentPasswordValid) {
    //   return res.status(400).json({ success: false, error: "Current password is incorrect" });
    // }
    // const newPasswordHash = await bcrypt.hash(newPassword, 12);
    // await updateUserPassword(userId, newPasswordHash);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
    });
  }
});

// POST /api/profile/upload-avatar - Upload profile picture
router.post("/upload-avatar", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    // In real implementation, handle file upload with multer or similar
    const { avatarData } = req.body;

    if (!avatarData) {
      return res.status(400).json({
        success: false,
        error: "Avatar data is required",
      });
    }

    const db = await connectDB();
    // Simulate avatar upload and update
    // In real implementation:
    // 1. Validate file type and size
    // 2. Upload to cloud storage or local filesystem
    // 3. Update user avatar URL in database

    await db.execute("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarData,
      userId,
    ]);

    res.json({
      success: true,
      data: { avatar: avatarData },
      message: "Avatar updated successfully",
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload avatar",
    });
  }
});

// GET /api/profile/stats - Example: return static stats (replace with DB query if needed)
router.get("/stats", async (req, res) => {
  try {
    // Example: fetch stats from DB if available
    res.json({ success: true, data: {} });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch statistics" });
  }
});

// GET /api/profile/permissions - Example: return static permissions (replace with DB query if needed)
router.get("/permissions", async (req, res) => {
  try {
    // Example: fetch permissions from DB if available
    res.json({ success: true, data: [] });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch permissions" });
  }
});

// PUT /api/profile/preferences - Update user preferences only
router.put("/preferences", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: "Preferences data is required",
      });
    }

    const db = await connectDB();
    await db.execute("UPDATE user_preferences SET ? WHERE user_id = ?", [
      preferences,
      userId,
    ]);

    res.json({
      success: true,
      data: preferences,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences",
    });
  }
});

// POST /api/profile/deactivate - Deactivate user account
router.post("/deactivate", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { reason, confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password confirmation is required",
      });
    }

    const db = await connectDB();
    // In real implementation, verify password and deactivate account
    await db.execute(
      "UPDATE users SET status = 'deactivated', deactivation_reason = ?, deactivation_date = NOW() WHERE id = ?",
      [reason || "User requested", userId]
    );

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deactivate account",
    });
  }
});

export default router;
