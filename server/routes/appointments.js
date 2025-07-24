const express = require("express")
const router = express.Router()
const Appointment = require("../models/Appointment")
const logger = require("../utils/logger")
const { body, validationResult, param } = require("express-validator")

// Validation middleware
const validateAppointment = [
  body("patientName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Patient name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("phone")
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("doctor").trim().notEmpty().withMessage("Doctor is required"),
  body("specialty").trim().notEmpty().withMessage("Specialty is required"),
  body("date")
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value < new Date().setHours(0, 0, 0, 0)) {
        throw new Error("Appointment date cannot be in the past")
      }
      return true
    }),
  body("time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid time format (HH:MM)"),
  body("reason").optional().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),
]

const validateId = [param("id").isMongoId().withMessage("Invalid appointment ID")]

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, doctor, startDate, endDate } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (doctor) query.doctor = new RegExp(doctor, "i")
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await Appointment.countDocuments(query)

    logger.info(`Retrieved ${appointments.length} appointments`)

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Public
router.get("/:id", validateId, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    logger.info(`Retrieved appointment ${req.params.id}`)

    res.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
router.post("/", validateAppointment, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctor: req.body.doctor,
      date: req.body.date,
      time: req.body.time,
      status: { $ne: "cancelled" },
    })

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
      })
    }

    const appointment = await Appointment.create(req.body)

    logger.info(`Created new appointment ${appointment._id} for ${appointment.patientName}`)

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment created successfully",
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Public
router.put("/:id", [...validateId, ...validateAppointment], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    logger.info(`Updated appointment ${req.params.id}`)

    res.json({
      success: true,
      data: appointment,
      message: "Appointment updated successfully",
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Public
router.patch(
  "/:id/status",
  [
    ...validateId,
    body("status").isIn(["scheduled", "completed", "cancelled", "no-show"]).withMessage("Invalid status value"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true },
      )

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        })
      }

      logger.info(`Updated appointment ${req.params.id} status to ${req.body.status}`)

      res.json({
        success: true,
        data: appointment,
        message: "Appointment status updated successfully",
      })
    } catch (error) {
      next(error)
    }
  },
)

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Public
router.delete("/:id", validateId, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const appointment = await Appointment.findByIdAndDelete(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    logger.info(`Deleted appointment ${req.params.id}`)

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Public
router.get("/stats/overview", async (req, res, next) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const totalAppointments = await Appointment.countDocuments()
    const upcomingAppointments = await Appointment.countDocuments({
      date: { $gte: new Date() },
      status: "scheduled",
    })

    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    logger.info("Retrieved appointment statistics")

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalAppointments,
        upcomingAppointments,
        monthlyStats,
      },
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
