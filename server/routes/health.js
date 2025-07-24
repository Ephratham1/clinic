const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const logger = require("../utils/logger")

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    // Get system info
    const healthCheck = {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    }

    // If database is not connected, return 503
    if (dbStatus !== "connected") {
      return res.status(503).json({
        ...healthCheck,
        status: "ERROR",
        message: "Database connection failed",
      })
    }

    logger.info("Health check performed successfully")
    res.json(healthCheck)
  } catch (error) {
    logger.error("Health check failed:", error)
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: "Health check failed",
      error: error.message,
    })
  }
})

// @desc    Detailed health check
// @route   GET /api/health/detailed
// @access  Public
router.get("/detailed", async (req, res) => {
  try {
    const Appointment = require("../models/Appointment")

    // Test database operations
    const appointmentCount = await Appointment.countDocuments()
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(1)

    const detailedHealth = {
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "OK",
          responseTime: Date.now(),
          collections: {
            appointments: {
              count: appointmentCount,
              lastCreated: recentAppointments[0]?.createdAt || null,
            },
          },
        },
        api: {
          status: "OK",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
      },
    }

    detailedHealth.services.database.responseTime = Date.now() - detailedHealth.services.database.responseTime

    res.json(detailedHealth)
  } catch (error) {
    logger.error("Detailed health check failed:", error)
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: "Detailed health check failed",
      error: error.message,
    })
  }
})

module.exports = router
