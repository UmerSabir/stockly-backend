import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(errorHandler);

// routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: "Too many requests, please try again later."
});
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);


// test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

export default app;