// // server.js
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import xss from "xss-clean";
// import rateLimit from "express-rate-limit";
// import dotenv from "dotenv";
// import connectDb from "./config/connectdb.js";

// // Routes
// import userRoutes from "./routes/userRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import recordRoutes from "./routes/recordRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import settingRoutes from "./routes/settingRoutes.js";
// import healthRoutes from './routes/healthRoutes.js'
// import metricsRoutes from "./routes/metricsRoutes.js";


// import doctorRoutes from "./routes/doctorRoutes.js";
// import appointmentRoutes from "./routes/appointmentRoutes.js";

// import medicineRoutes from "./routes/medicineRoutes.js"
// import orderRoutes from "./routes/orderRoutes.js"
// import paymentRoutes from "./routes/paymentRoutes.js"

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;
// const DATABASE_URL = process.env.DATABASE_URL;

// // ------------------
// // Connect to MongoDB
// // ------------------
// connectDb(DATABASE_URL);

// // ------------------
// // Middleware
// // ------------------
// app.use(express.json()); // Parse JSON body
// app.use(cors({ origin: "http://localhost:5173", credentials: true })); // CORS
// app.use(helmet()); // Security headers
// app.use(xss()); // Prevent XSS attacks

// // Rate limiter: 100 requests per 10 minutes
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later",
// });
// app.use(limiter);

// // ------------------
// // Routes
// // ------------------
// app.use("/api/health", healthRoutes);
// app.use("/api/metrics", metricsRoutes);

// app.use("/api/users", userRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/records", recordRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/settings", settingRoutes);

// app.use("/api/doctors", doctorRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/medicine", medicineRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);


// // ------------------
// // Error Handling Middleware
// // ------------------
// app.use((req, res, next) => {
//   res.status(404).json({ message: "API route not found" });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Server error", error: err.message });
// });

// // ------------------
// // Start Server
// // ------------------
// app.listen(port, () => {
//   console.log(
//     `App is running at http://localhost:${port} in ${
//       process.env.NODE_ENV || "development"
//     } mode`
//   );
// });





// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDb from "./config/connectdb.js";
// import { sessionMiddleware, redisClient } from "./config/redisSession.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import healthRoutes from './routes/healthRoutes.js';
import metricsRoutes from "./routes/metricsRoutes.js";

import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import RateLimitRedis from "rate-limit-redis";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ------------------
// Validate Environment Variables
// ------------------
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required in environment variables");
}

// ------------------
// Connect to MongoDB
// ------------------
connectDb(DATABASE_URL);

// ------------------
// Middleware
// ------------------
// app.use(sessionMiddleware); // ✅ Use redis session middleware
app.use(express.json());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(xss());
app.use(compression());
app.use(morgan("dev"));

// ------------------
// Redis-backed Rate Limiter
// ------------------
// const limiter = rateLimit({
//   store: new RateLimitRedis({
//     sendCommand: (...args) => redisClient.sendCommand(args),
//   }),
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 100,
//   message: "Too many requests from this IP, please try again later",
// });

// app.use(limiter);

// ------------------
// Redis Caching Middleware
// ------------------
export const cacheMiddleware = (keyPrefix) => async (req, res, next) => {
  try {
    const key = `${keyPrefix}:${req.originalUrl}`;
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      await redisClient.set(key, JSON.stringify(data), { EX: 60 * 5 }); // 5 min cache
      originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Redis cache error:", err);
    next();
  }
};

// ------------------
// Routes (Versioned)
// ------------------
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metrics", metricsRoutes);

app.use("/api/v1/users", cacheMiddleware("users"), userRoutes);
app.use("/api/v1/categories", cacheMiddleware("categories"), categoryRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/settings", settingRoutes);

app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/medicine", medicineRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

// ------------------
// 404 Handler
// ------------------
app.use((req, res) => {
  res.status(404).json({ status: "fail", message: "API route not found" });
});

// ------------------
// Error Handling Middleware
// ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ status: "error", message });
});

// ------------------
// Graceful Shutdown
// ------------------
process.on("SIGINT", async () => {
  await redisClient.quit();
  console.log("Redis disconnected");
  process.exit(0);
});

// ------------------
// Start Server
// ------------------
app.listen(port, () => {
  console.log(
    `🚀 Server running at http://localhost:${port} in ${process.env.NODE_ENV || "development"} mode`
  );
});
