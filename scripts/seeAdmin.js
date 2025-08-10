import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // Make sure this exists and uses MySQL2
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// JWT Auth Middleware
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
    });
  } else {
    next();
  }
});

// Use your MySQL2 routes
app.use("/api/users", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
