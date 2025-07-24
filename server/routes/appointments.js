const express = require("express")
const router = express.Router()
const Appointment = require("../models/Appointment")
const logger = require("../utils/logger")
const { body, validationResult, param, query } = require("express-validator")

// Validation middleware
const validateAppointment = [
  body("patientName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Patient name must be between 2 and 100 characters"),
  body("patientEmail").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("patientPhone")
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),
  body("doctorName").trim().notEmpty().withMessage("Doctor name is required"),
  body("department")
    .isIn([
      "General Medicine",
      "Cardiology",
      "Dermatology",
      "Orthopedics",
      "Pediatrics",
      "Gynecology",
      "Neurology",
      "Psychiatry",
    ])
    .withMessage("Please select a valid department"),
  body("appointmentDate")
    .isISO8601()
    .toDate()
    .custom((date) => {
      if (date <= new Date()) {
        throw new Error("Appointment date must be in the future")
      }
      return true
    }),
  body("appointmentTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please provide a valid time in HH:MM format"),
  body("reason").trim().isLength({ min: 5, max: 500 }).withMessage("Reason must be between 5 and 500 characters"),
  body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
]

const validateId = [param("id").isMongoId().withMessage("Invalid appointment ID")]

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["scheduled", "confirmed", "completed", "cancelled", "no-show"]),
    query("department")
      .optional()
      .isIn([
        "General Medicine",
        "Cardiology",
        "Dermatology",
        "Orthopedics",
        "Pediatrics",
        "Gynecology",
        "Neurology",
        "Psychiatry",
      ]),
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
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

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      // Build filter object
      const filter = {}
      if (req.query.status) filter.status = req.query.status
      if (req.query.department) filter.department = req.query.department
      if (req.query.startDate || req.query.endDate) {
        filter.appointmentDate = {}
        if (req.query.startDate) filter.appointmentDate.$gte = req.query.startDate
        if (req.query.endDate) filter.appointmentDate.$lte = req.query.endDate
      }

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit)
        .exec()

      const total = await Appointment.countDocuments(filter)

      logger.info(`Retrieved ${appointments.length} appointments`, {
        page,
        limit,
        total,
        filter,
      })

      res.json({
        success: true,
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

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
      doctorName: req.body.doctorName,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      status: { $ne: "cancelled" },
    })

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
      })
    }

    const appointment = await Appointment.create(req.body)

    logger.info(`Created new appointment ${appointment._id} for ${appointment.patientName}`, {
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.appointmentDate,
    })

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

    // Check for conflicting appointments (excluding current appointment)
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      doctorName: req.body.doctorName,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime,
      status: { $in: ["scheduled", "confirmed"] },
    })

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked for the selected doctor",
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
    body("status")
      .isIn(["scheduled", "confirmed", "completed", "cancelled", "no-show"])
      .withMessage("Invalid status value"),
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
// @route   GET /api/appointments/stats/overview
// @access  Public
router.get("/stats/overview", async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const stats = await Promise.all([
      Appointment.countDocuments({ status: "scheduled" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
      }),
      Appointment.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ])

    res.json({
      success: true,
      data: {
        totalScheduled: stats[0],
        totalConfirmed: stats[1],
        totalCompleted: stats[2],
        totalCancelled: stats[3],
        todayAppointments: stats[4],
        departmentStats: stats[5],
      },
    })

    logger.info("Retrieved appointment statistics")
  } catch (error) {
    next(error)
  }
})

module.exports = router
