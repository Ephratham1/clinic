"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  TextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toaster, toast } from "@/components/ui/sonner"

interface Appointment {
  _id: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: "scheduled" | "completed" | "cancelled"
  createdAt: string
}

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("")
  const [patientName, setPatientName] = useState<string>("")
  const [patientEmail, setPatientEmail] = useState<string>("")
  const [patientPhone, setPatientPhone] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/v1/appointments`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAppointments(data.data)
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to fetch appointments", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!date || !time || !patientName || !reason) {
      toast.error("Missing Information", { description: "Please fill in all required fields." })
      return
    }

    const newAppointment = {
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate: date.toISOString(),
      appointmentTime: time,
      reason,
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast.success("Appointment Booked!", {
        description: `Appointment for ${patientName} on ${format(date, "PPP")} at ${time} has been scheduled.`,
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      })

      // Clear form
      setPatientName("")
      setPatientEmail("")
      setPatientPhone("")
      setDate(new Date())
      setTime("")
      setReason("")
      fetchAppointments() // Refresh the list
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to book appointment", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: "scheduled" | "completed" | "cancelled") => {
    try {
      const response = await fetch(`${API_URL}/api/v1/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast.success("Appointment Status Updated!", {
        description: `Appointment status changed to ${newStatus}.`,
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      })
      fetchAppointments() // Refresh the list
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to update status", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/appointments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast.success("Appointment Deleted!", {
        description: "The appointment has been successfully removed.",
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      })
      fetchAppointments() // Refresh the list
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to delete appointment", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 9; i <= 17; i++) {
      // From 9 AM to 5 PM
      slots.push(`${i.toString().padStart(2, "0")}:00`)
      if (i < 17) {
        // Don't add :30 for 5 PM
        slots.push(`${i.toString().padStart(2, "0")}:30`)
      }
    }
    return slots
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
        Clinic Appointment System
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Book Appointment Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Book New Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Patient Name{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    placeholder="John Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientEmail" className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Patient Email
                  </Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientPhone" className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Patient Phone
                  </Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    placeholder="123-456-7890"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Appointment Date{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Appointment Time{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select value={time} onValueChange={setTime} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeSlots().map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <TextIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> Reason for Appointment{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Briefly describe the reason for your visit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Book Appointment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upcoming Appointments Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Loading appointments...</p>
            ) : error ? (
              <p className="text-center text-red-500">Error: {error}</p>
            ) : appointments.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">No upcoming appointments.</p>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((app) => app.status === "scheduled" && new Date(app.appointmentDate) >= new Date())
                  .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .map((appointment) => (
                    <Card key={appointment._id} className="p-4 border dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {appointment.patientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(appointment.appointmentDate), "PPP")} at {appointment.appointmentTime}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reason: {appointment.reason}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Select
                            value={appointment.status}
                            onValueChange={(value: "scheduled" | "completed" | "cancelled") =>
                              handleStatusChange(appointment._id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px] text-xs">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(appointment._id)}
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
