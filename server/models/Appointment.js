const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },
    patientEmail: {
      type: String,
      required: [true, "Patient email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    patientPhone: {
      type: String,
      required: [true, "Patient phone is required"],
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator: (date) => date > new Date(),
        message: "Appointment date must be in the future",
      },
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in HH:MM format"],
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      maxlength: [100, "Doctor name cannot exceed 100 characters"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: [
          "General Medicine",
          "Cardiology",
          "Dermatology",
          "Orthopedics",
          "Pediatrics",
          "Gynecology",
          "Neurology",
          "Psychiatry",
        ],
        message: "Please select a valid department",
      },
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "confirmed", "completed", "cancelled", "no-show"],
        message: "Please select a valid status",
      },
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 })
appointmentSchema.index({ patientEmail: 1 })
appointmentSchema.index({ doctorName: 1 })
appointmentSchema.index({ status: 1 })
appointmentSchema.index({ createdAt: -1 })

// Virtual for full appointment datetime
appointmentSchema.virtual("fullDateTime").get(function () {
  const date = new Date(this.appointmentDate)
  const [hours, minutes] = this.appointmentTime.split(":")
  date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
  return date
})

// Pre-save middleware to update updatedAt
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ appointmentDate: 1, appointmentTime: 1 })
}

// Instance method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function () {
  const now = new Date()
  const appointmentDateTime = this.fullDateTime
  return appointmentDateTime > now && this.status === "scheduled"
}

module.exports = mongoose.model("Appointment", appointmentSchema)
