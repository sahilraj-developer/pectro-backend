// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDb from "./config/connectdb.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import healthRoutes from './routes/healthRoutes.js'
import metricsRoutes from "./routes/metricsRoutes.js";


import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

import medicineRoutes from "./routes/medicineRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;

// ------------------
// Connect to MongoDB
// ------------------
connectDb(DATABASE_URL);

// ------------------
// Middleware
// ------------------
app.use(express.json()); // Parse JSON body
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // CORS
app.use(helmet()); // Security headers
app.use(xss()); // Prevent XSS attacks

// Rate limiter: 100 requests per 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use(limiter);

// ------------------
// Routes
// ------------------
app.use("/api/health", healthRoutes);
app.use("/api/metrics", metricsRoutes);

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);

app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);


// ------------------
// Error Handling Middleware
// ------------------
app.use((req, res, next) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ------------------
// Start Server
// ------------------
app.listen(port, () => {
  console.log(
    `App is running at http://localhost:${port} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
