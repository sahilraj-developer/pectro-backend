// routes/metricsRoutes.js
import express from "express";
import client from "prom-client";

const router = express.Router();

// --- Initialize Prometheus client ---
client.collectDefaultMetrics(); // Collects CPU, memory, event loop, etc. automatically

// --- Custom metrics (optional) ---
const httpRequestCount = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Middleware to record all requests
router.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCount.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });
  next();
});

// --- Metrics endpoint ---
router.get("/", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
});

export default router;
