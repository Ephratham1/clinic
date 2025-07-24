const mongoose = require("mongoose")
const Appointment = require("../server/models/Appointment") // Adjust path as needed
require("dotenv").config({ path: "./server/.env" }) // Load environment variables

const setupAtlas = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      console.error(
        "MONGODB_URI environment variable is not defined. Please set it in server/.env or your environment.",
      )
      process.exit(1)
    }

    console.log("Connecting to MongoDB Atlas for setup...")
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: "majority",
    })
    console.log("Connected to MongoDB Atlas.")

    // 1. Create Indexes
    console.log("Creating indexes...")
    await Appointment.collection.createIndex({ appointmentDate: 1, appointmentTime: 1 }, { unique: true })
    await Appointment.collection.createIndex({ patientEmail: 1 })
    await Appointment.collection.createIndex({ status: 1 })
    console.log("Indexes created successfully.")

    // 2. Seed Sample Data (Optional)
    console.log("Seeding sample data (if collection is empty)...")
    const count = await Appointment.countDocuments()
    if (count === 0) {
      const sampleAppointments = [
        {
          patientName: "Alice Smith",
          patientEmail: "alice.smith@example.com",
          patientPhone: "123-456-7890",
          appointmentDate: new Date("2025-08-01T10:00:00Z"),
          appointmentTime: "10:00",
          reason: "Routine check-up",
          status: "scheduled",
        },
        {
          patientName: "Bob Johnson",
          patientEmail: "bob.j@example.com",
          patientPhone: "098-765-4321",
          appointmentDate: new Date("2025-08-01T14:30:00Z"),
          appointmentTime: "14:30",
          reason: "Dental cleaning",
          status: "scheduled",
        },
        {
          patientName: "Charlie Brown",
          patientEmail: "charlie.b@example.com",
          patientPhone: "555-123-4567",
          appointmentDate: new Date("2025-07-20T09:00:00Z"),
          appointmentTime: "09:00",
          reason: "Follow-up",
          status: "completed",
        },
      ]
      await Appointment.insertMany(sampleAppointments)
      console.log(`${sampleAppointments.length} sample appointments added.`)
    } else {
      console.log("Appointments collection is not empty, skipping seeding.")
    }

    console.log("MongoDB Atlas setup complete!")
  } catch (error) {
    console.error("Error during MongoDB Atlas setup:", error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB Atlas.")
  }
}

setupAtlas()
