"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAppointments } from "../context/AppointmentContext"
import { Calendar, Clock, User, FileText } from "lucide-react"

const BookAppointment = () => {
  const { toast } = useToast()
  const { addAppointment } = useAppointments()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    reason: "",
  })

  const doctors = [
    { id: "dr-smith", name: "Dr. Sarah Smith", specialty: "General Medicine" },
    { id: "dr-johnson", name: "Dr. Michael Johnson", specialty: "Cardiology" },
    { id: "dr-williams", name: "Dr. Emily Williams", specialty: "Dermatology" },
    { id: "dr-brown", name: "Dr. David Brown", specialty: "Orthopedics" },
    { id: "dr-davis", name: "Dr. Lisa Davis", specialty: "Pediatrics" },
  ]

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const selectedDoctor = doctors.find((d) => d.id === formData.doctor)

      const appointment = {
        id: Date.now().toString(),
        patientName: formData.patientName,
        email: formData.email,
        phone: formData.phone,
        doctor: selectedDoctor?.name || "",
        specialty: selectedDoctor?.specialty || "",
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        status: "scheduled" as const,
        createdAt: new Date().toISOString(),
      }

      addAppointment(appointment)

      toast({
        title: "Appointment Booked Successfully!",
        description: `Your appointment with ${selectedDoctor?.name} is scheduled for ${formData.date} at ${formData.time}.`,
      })

      // Reset form
      setFormData({
        patientName: "",
        email: "",
        phone: "",
        doctor: "",
        specialty: "",
        date: "",
        time: "",
        reason: "",
      })
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-fill specialty when doctor is selected
    if (field === "doctor") {
      const selectedDoctor = doctors.find((d) => d.id === value)
      if (selectedDoctor) {
        setFormData((prev) => ({ ...prev, specialty: selectedDoctor.specialty }))
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span>Book New Appointment</span>
          </CardTitle>
          <CardDescription>
            Fill out the form below to schedule your appointment with one of our healthcare professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Information</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Full Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange("patientName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Appointment Details</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor *</Label>
                  <Select value={formData.doctor} onValueChange={(value) => handleInputChange("doctor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    readOnly
                    placeholder="Auto-filled based on doctor"
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Reason for Visit</span>
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Please describe the reason for your visit (optional)"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Booking Appointment..." : "Book Appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default BookAppointment
