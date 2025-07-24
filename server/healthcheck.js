const http = require("http")
const mongoose = require("mongoose")
const logger = require("./utils/logger") // Ensure logger is correctly configured to handle no file system access if needed

const checkDatabaseConnection = async () => {
  try {
    // Check if mongoose connection is ready
    if (mongoose.connection.readyState === 1) {
      // 1 means connected
      await mongoose.connection.db.admin().ping() // Ping the database to ensure it's responsive
      return true
    }
    return false
  } catch (error) {
    logger.error("Database health check failed:", error.message)
    return false
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    const dbConnected = await checkDatabaseConnection()
    const status = dbConnected ? 200 : 503
    const message = dbConnected ? "OK" : "Service Unavailable (Database Down)"

    res.writeHead(status, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: message, database: dbConnected ? "connected" : "disconnected" }))
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not Found")
  }
})

const PORT = process.env.PORT || 5000 // Use the same port as the main app or a dedicated one

server.listen(PORT, () => {
  logger.info(`Healthcheck server running on port ${PORT}`)
})

// Connect to DB for health check purposes
require("./config/database")()
