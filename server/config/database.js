const mongoose = require("mongoose")
const logger = require("../utils/logger")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // Deprecated in Mongoose 6.x
      // useFindAndModify: false // Deprecated in Mongoose 6.x
    })

    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error(`Error: ${err.message}`)
    process.exit(1) // Exit process with failure
  }
}

module.exports = connectDB
