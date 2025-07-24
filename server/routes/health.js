const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const logger = require("../utils/logger")

// @desc    Get API health status
// @route   GET /health
// @access  Public
router.get("/", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    let dbMessage = "disconnected"
    if (dbStatus === 1) {
      dbMessage = "connected"
    } else if (dbStatus === 2) {
      dbMessage = "connecting"
    } else if (dbStatus === 3) {
      dbMessage = "disconnecting"
    }

    const healthStatus = {
      status: "UP",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: dbMessage,
        connection: mongoose.connection.host ? `${mongoose.connection.host}:${mongoose.connection.port}` : "N/A",
        dbName: mongoose.connection.name || "N/A",
      },
      server: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    }

    if (dbStatus !== 1) {
      res.status(503).json(healthStatus) // Service Unavailable if DB is not connected
    } else {
      res.status(200).json(healthStatus)
    }
  } catch (error) {
    logger.error(`Health check error: ${error.message}`)
    res.status(500).json({ status: "DOWN", error: error.message })
  }
})

module.exports = router
