const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    doctor: {
      type: String,
      required: [true, "Doctor is required"],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator: (value) => value >= new Date().setHours(0, 0, 0, 0),
        message: "Appointment date cannot be in the past",
      },
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time format (HH:MM)"],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
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
appointmentSchema.index({ date: 1, time: 1 })
appointmentSchema.index({ email: 1 })
appointmentSchema.index({ status: 1 })
appointmentSchema.index({ doctor: 1 })

// Virtual for formatted date
appointmentSchema.virtual("formattedDate").get(function () {
  return this.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
})

// Pre-save middleware to update updatedAt
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1, time: 1 })
}

// Instance method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function () {
  const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.time}`)
  return appointmentDateTime > new Date() && this.status === "scheduled"
}

module.exports = mongoose.model("Appointment", appointmentSchema)
