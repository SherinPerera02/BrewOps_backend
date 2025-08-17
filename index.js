import bodyParser from "body-parser";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import connectDB from "./config/db.js";
dotenv.config();

const app = express();

// Ensure database connection
connectDB()
  .then(() => {
    console.log("MySQL connected");
  })
  .catch((err) => console.error("MySQL connection error:", err));

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        console.log(decoded);
        req.user = decoded;
        next();
      } else {
        console.log("Token is not provided");
        res.status(403).json({
          message: "Token is not provided",
        });
      }
    });
  } else {
    next();
  }
});

app.use("/api/users", authRoutes);
app.use("/api/admin", authRoutes);
app.use("/inventory", inventoryRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
