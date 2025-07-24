const express = require("express")
const mongoose = require("mongoose")
const logger = require("../utils/logger")

const router = express.Router()

// Basic health check
router.get("/", async (req, res) => {
  try {
    const health = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      services: {
        database: "checking...",
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
        },
      },
    }

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = "connected"
    } else {
      health.services.database = "disconnected"
      health.status = "WARNING"
    }

    const statusCode = health.status === "OK" ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    logger.error("Health check failed:", error)
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    })
  }
})

// Detailed health check
router.get("/detailed", async (req, res) => {
  try {
    const detailed = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + " MB",
      },
      database: {
        status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
      },
    }

    const statusCode = detailed.database.status === "connected" ? 200 : 503
    res.status(statusCode).json(detailed)
  } catch (error) {
    logger.error("Detailed health check failed:", error)
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    })
  }
})

module.exports = router
