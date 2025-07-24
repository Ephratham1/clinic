// MongoDB Atlas Database Setup Script
// Run this script to create indexes and initial data

const { MongoClient } = require("mongodb")

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://ephratham:ephratham@cluster0.x3irutl.mongodb.net/clinic?retryWrites=true&w=majority&appName=Cluster0"

async function setupDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB Atlas")

    const db = client.db("clinic")

    // Create appointments collection with indexes
    const appointmentsCollection = db.collection("appointments")

    // Create indexes for better performance
    await appointmentsCollection.createIndex({ patientEmail: 1 })
    await appointmentsCollection.createIndex({ appointmentDate: 1 })
    await appointmentsCollection.createIndex({ status: 1 })
    await appointmentsCollection.createIndex({ doctorName: 1 })
    await appointmentsCollection.createIndex({ createdAt: -1 })

    console.log("Created indexes for appointments collection")

    // Create sample data if collection is empty
    const count = await appointmentsCollection.countDocuments()

    if (count === 0) {
      const sampleAppointments = [
        {
          patientName: "John Doe",
          patientEmail: "john.doe@example.com",
          patientPhone: "+1234567890",
          doctorName: "Dr. Smith",
          appointmentDate: new Date("2024-02-15T10:00:00Z"),
          appointmentType: "General Checkup",
          status: "scheduled",
          notes: "Regular checkup appointment",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          patientName: "Jane Smith",
          patientEmail: "jane.smith@example.com",
          patientPhone: "+1234567891",
          doctorName: "Dr. Johnson",
          appointmentDate: new Date("2024-02-16T14:30:00Z"),
          appointmentType: "Consultation",
          status: "scheduled",
          notes: "Follow-up consultation",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      await appointmentsCollection.insertMany(sampleAppointments)
      console.log("Inserted sample appointments")
    }

    // Create users collection for future authentication
    const usersCollection = db.collection("users")
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ role: 1 })

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await client.close()
  }
}

// Run the setup
setupDatabase().catch(console.error)
