const mongoose = require("mongoose")
const logger = require("../utils/logger")

class Database {
  constructor() {
    this.connection = null
    this.isConnected = false
  }

  async connect() {
    try {
      // MongoDB Atlas connection string from environment
      const mongoUri = process.env.MONGODB_URI

      if (!mongoUri) {
        throw new Error("MONGODB_URI environment variable is not defined")
      }

      // Atlas-optimized connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: "majority",
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      }

      // Connect to MongoDB Atlas
      this.connection = await mongoose.connect(mongoUri, options)
      this.isConnected = true

      logger.info("Successfully connected to MongoDB Atlas")

      // Connection event handlers
      mongoose.connection.on("connected", () => {
        logger.info("Mongoose connected to MongoDB Atlas")
        this.isConnected = true
      })

      mongoose.connection.on("error", (err) => {
        logger.error("Mongoose connection error:", err)
        this.isConnected = false
      })

      mongoose.connection.on("disconnected", () => {
        logger.warn("Mongoose disconnected from MongoDB Atlas")
        this.isConnected = false
      })

      // Handle application termination
      process.on("SIGINT", this.gracefulShutdown.bind(this))
      process.on("SIGTERM", this.gracefulShutdown.bind(this))

      return this.connection
    } catch (error) {
      logger.error("Failed to connect to MongoDB Atlas:", error)
      this.isConnected = false
      throw error
    }
  }

  async gracefulShutdown() {
    try {
      if (this.connection) {
        await mongoose.connection.close()
        logger.info("MongoDB Atlas connection closed through app termination")
        this.isConnected = false
      }
      process.exit(0)
    } catch (error) {
      logger.error("Error during graceful shutdown:", error)
      process.exit(1)
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", message: "Not connected to database" }
      }

      // Ping the database
      await mongoose.connection.db.admin().ping()

      return {
        status: "healthy",
        message: "Database connection is healthy",
        details: this.getConnectionStatus(),
      }
    } catch (error) {
      logger.error("Database health check failed:", error)
      return {
        status: "unhealthy",
        message: error.message,
        details: this.getConnectionStatus(),
      }
    }
  }
}

// Export singleton instance
const database = new Database()
module.exports = database
