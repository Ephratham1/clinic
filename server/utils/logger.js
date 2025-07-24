const winston = require("winston")
const path = require("path")
const fs = require("fs")

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs")
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }
} catch (error) {
  console.warn("Could not create logs directory:", error.message)
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "clinic-appointment-api" },
  transports: [],
})

// Add file transports only if logs directory exists
try {
  if (fs.existsSync(logsDir)) {
    logger.add(
      new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    )

    logger.add(
      new winston.transports.File({
        filename: path.join(logsDir, "combined.log"),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    )
  }
} catch (error) {
  console.warn("Could not add file transports:", error.message)
}

// Always add console transport
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  }),
)

module.exports = logger
