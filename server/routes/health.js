const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    // Get system info
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    }

    // If database is not connected, return 503
    if (dbStatus !== "connected") {
      return res.status(503).json({
        ...healthCheck,
        status: "ERROR",
        message: "Database connection failed",
      })
    }

    res.status(200).json(healthCheck)
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: error.message,
    })
  }
})

// Detailed health check
router.get("/detailed", async (req, res) => {
  try {
    const detailed = {
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: mongoose.connection.readyState === 1 ? "healthy" : "unhealthy",
          responseTime: Date.now(),
        },
        api: {
          status: "healthy",
          uptime: process.uptime(),
        },
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    }

    res.status(200).json(detailed)
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: error.message,
    })
  }
})

module.exports = router
