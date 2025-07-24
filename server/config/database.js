const mongoose = require("mongoose")
const logger = require("../utils/logger")

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      retryWrites: true,
      w: "majority",
    }

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
      await mongoose.connection.close()
      logger.info("Mongoose connection closed through app termination")
      process.exit(0)
    })
  } catch (error) {
    logger.error("Database connection failed:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
