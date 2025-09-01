import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is required",
    });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;
    next();
  });
};

export default authenticateToken;
