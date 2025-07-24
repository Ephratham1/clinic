// MongoDB initialization script
const db = db.getSiblingDB("clinic")

// Create collections
db.createCollection("appointments")

// Create indexes for better performance
db.appointments.createIndex({ date: 1, time: 1 })
db.appointments.createIndex({ email: 1 })
db.appointments.createIndex({ status: 1 })
db.appointments.createIndex({ doctor: 1 })
db.appointments.createIndex({ createdAt: 1 })

// Insert sample data
db.appointments.insertMany([
  {
    patientName: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    doctor: "Dr. Sarah Smith",
    specialty: "General Medicine",
    date: new Date("2024-02-15"),
    time: "10:00",
    reason: "Annual checkup",
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    patientName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 987-6543",
    doctor: "Dr. Michael Johnson",
    specialty: "Cardiology",
    date: new Date("2024-02-12"),
    time: "14:30",
    reason: "Heart palpitations",
    status: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

print("Database initialized successfully")
