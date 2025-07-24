const mongoose = require("mongoose")
const logger = require("../utils/logger")

// MongoDB Atlas connection configuration
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    // Connection options optimized for Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: "majority",
      bufferCommands: false,
      bufferMaxEntries: 0,
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoURI, options)

    logger.info(`MongoDB Atlas connected: ${conn.connection.host}`)

    // Connection event handlers
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB Atlas")
    })

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB Atlas")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close()
        logger.info("MongoDB Atlas connection closed through app termination")
        process.exit(0)
      } catch (error) {
        logger.error("Error during graceful shutdown:", error)
        process.exit(1)
      }
    })

    return conn
  } catch (error) {
    logger.error("MongoDB Atlas connection error:", error)
    process.exit(1)
  }
}

module.exports = connectDB
