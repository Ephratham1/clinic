require("dotenv").config({ path: "./server/.env" }) // Load environment variables from server/.env

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
const connectDB = require("./config/database")
const errorHandler = require("./middleware/errorHandler")
const logger = require("./utils/logger")

// Route files
const appointments = require("./routes/appointments")
const health = require("./routes/health")

// Connect to database
connectDB()

const app = express()

// Body parser
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Set security headers
app.use(helmet())

// Sanitize data
app.use(mongoSanitize())

// Prevent XSS attacks
app.use(xss())

// Prevent http param pollution
app.use(hpp())

// Enable CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10), // Max 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})
app.use(limiter)

// Mount routers
app.use("/api/v1/appointments", appointments)
app.use("/health", health)

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})

module.exports = app // Export app for testing
