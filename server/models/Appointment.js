const mongoose = require("mongoose")

const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "Please add a patient name"],
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  patientEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
  },
  patientPhone: {
    type: String,
    maxlength: [20, "Phone number can not be longer than 20 characters"],
  },
  appointmentDate: {
    type: Date,
    required: [true, "Please add an appointment date"],
  },
  appointmentTime: {
    type: String,
    required: [true, "Please add an appointment time"],
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
      "Please add a valid time in HH:MM format",
    ],
  },
  reason: {
    type: String,
    required: [true, "Please add a reason for the appointment"],
    maxlength: [200, "Reason can not be more than 200 characters"],
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Appointment", AppointmentSchema)
