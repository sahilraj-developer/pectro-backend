// routes/healthRoutes.js
import express from "express";
import mongoose from "mongoose";
import os from "os";
import si from "systeminformation";
import dns from "dns";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // --- Check MongoDB Connection ---
    const dbStatus =
      mongoose.connection.readyState === 1
        ? "connected"
        : mongoose.connection.readyState === 2
        ? "connecting"
        : "disconnected";

    // --- System Info ---
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const load = os.loadavg();
    const cpu = await si.currentLoad();
    const disk = await si.fsSize();
    const networkInterfaces = await si.networkInterfaces();
    const networkStats = await si.networkStats();

    // --- DNS Latency Test (e.g., to Google DNS) ---
    const dnsLatency = await new Promise((resolve) => {
      const start = Date.now();
      dns.lookup("google.com", (err) =>
        resolve(err ? null : Date.now() - start)
      );
    });

    // --- Disk Usage Summary ---
    const totalDisk = disk.reduce((a, d) => a + d.size, 0);
    const usedDisk = disk.reduce((a, d) => a + d.used, 0);
    const diskUsagePercent = ((usedDisk / totalDisk) * 100).toFixed(2);

    // --- Evaluate Health ---
    const healthStatus =
      dbStatus === "connected" &&
      cpu.currentload < 85 &&
      diskUsagePercent < 90
        ? "healthy"
        : "degraded";

    // --- Build Response ---
    const healthReport = {
      status: healthStatus,
      summary: {
        database: dbStatus,
        cpuLoadPercent: cpu.currentload?.toFixed(2),
        memoryUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        diskUsagePercent,
        uptimeSeconds: Math.round(uptime),
        dnsLatencyMs: dnsLatency,
        timestamp: new Date().toISOString(),
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        pid: process.pid,
      },
      resources: {
        memory: {
          rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        },
        cpu: {
          user: cpu.currentload_user?.toFixed(2),
          system: cpu.currentload_system?.toFixed(2),
          total: cpu.currentload?.toFixed(2),
        },
        disk: disk.map((d) => ({
          filesystem: d.fs,
          sizeGB: (d.size / 1024 / 1024 / 1024)?.toFixed(2),
          usedGB: (d.used / 1024 / 1024 / 1024)?.toFixed(2),
          usePercent: d.use?.toFixed(2),
          mount: d.mount,
        })),
        network: {
          interfaces: networkInterfaces.map((n) => ({
            iface: n.iface,
            ip4: n.ip4,
            mac: n.mac,
            speed: n.speed,
          })),
          stats: networkStats.map((n) => ({
            iface: n.iface,
            rxBytes: n.rx_bytes,
            txBytes: n.tx_bytes,
          })),
        },
      },
    };

    res.status(200).json(healthReport);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
