const { createLogger, format, transports } = require("winston")
const path = require("path")
const fs = require("fs")

const logDir = process.env.LOG_DIR || path.join(__dirname, "..", "logs")

// Ensure the log directory exists
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true })
  } catch (err) {
    console.error(`Failed to create log directory ${logDir}:`, err)
    // Fallback to console transport if directory creation fails
    module.exports = createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
      transports: [new transports.Console()],
    })
    // Exit early if directory creation failed
  }
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
  exceptionHandlers: [new transports.File({ filename: path.join(logDir, "exceptions.log") })],
  rejectionHandlers: [new transports.File({ filename: path.join(logDir, "rejections.log") })],
})

module.exports = logger
