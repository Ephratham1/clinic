const mongoose = require("mongoose")
require("dotenv").config()

const setupAtlas = async () => {
  try {
    console.log("🔧 Setting up MongoDB Atlas...")

    const mongoURI = process.env.MONGODB_URI
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined")
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB Atlas")

    // Create indexes for better performance
    const Appointment = require("../server/models/Appointment")

    console.log("📊 Creating database indexes...")
    await Appointment.createIndexes()
    console.log("✅ Database indexes created")

    // Create sample data (optional)
    const appointmentCount = await Appointment.countDocuments()
    if (appointmentCount === 0) {
      console.log("📝 Creating sample appointments...")

      const sampleAppointments = [
        {
          patientName: "John Doe",
          patientEmail: "john.doe@example.com",
          patientPhone: "+1234567890",
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          appointmentTime: "10:00",
          doctorName: "Dr. Smith",
          department: "General Medicine",
          reason: "Regular checkup",
          status: "scheduled",
        },
        {
          patientName: "Jane Smith",
          patientEmail: "jane.smith@example.com",
          patientPhone: "+1234567891",
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          appointmentTime: "14:30",
          doctorName: "Dr. Johnson",
          department: "Cardiology",
          reason: "Heart consultation",
          status: "confirmed",
        },
      ]

      await Appointment.insertMany(sampleAppointments)
      console.log("✅ Sample appointments created")
    } else {
      console.log(`✅ Database already contains ${appointmentCount} appointments`)
    }

    console.log("🎉 MongoDB Atlas setup complete!")
  } catch (error) {
    console.error("❌ Atlas setup failed:", error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

setupAtlas()
