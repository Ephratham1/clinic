const mongoose = require("mongoose")
const logger = require("../utils/logger")

const connectDB = async () => {
  try {
    // MongoDB Atlas connection string should be in environment variable
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://ephratham:ephratham@cluster0.x3irutl.mongodb.net/clinic?retryWrites=true&w=majority&appName=Cluster0"

    const conn = await mongoose.connect(mongoURI, {
      // Connection pooling options optimized for Atlas
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      // Atlas specific options
      retryWrites: true,
      w: "majority",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    logger.info(`MongoDB Atlas Connected: ${conn.connection.host}`)
    logger.info(`Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB Atlas connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB Atlas disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB Atlas reconnected")
    })

    mongoose.connection.on("connecting", () => {
      logger.info("Connecting to MongoDB Atlas...")
    })

    mongoose.connection.on("connected", () => {
      logger.info("Connected to MongoDB Atlas")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      logger.info("MongoDB Atlas connection closed through app termination")
      process.exit(0)
    })

    process.on("SIGTERM", async () => {
      await mongoose.connection.close()
      logger.info("MongoDB Atlas connection closed through SIGTERM")
      process.exit(0)
    })
  } catch (error) {
    logger.error("MongoDB Atlas connection failed:", error)
    process.exit(1)
  }
}

module.exports = { connectDB }
