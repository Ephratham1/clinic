"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ClockIcon, UserIcon, MailIcon, PhoneIcon, TextIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppointments } from "../context/AppointmentContext"
import { toast } from "@/components/ui/sonner"

export default function BookAppointment() {
  const { createAppointment } = useAppointments()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("")
  const [patientName, setPatientName] = useState<string>("")
  const [patientEmail, setPatientEmail] = useState<string>("")
  const [patientPhone, setPatientPhone] = useState<string>("")
  const [reason, setReason] = useState<string>("")

  const generateTimeSlots = () => {
    const slots = []
    for (let i = 9; i <= 17; i++) {
      // From 9 AM to 5 PM
      slots.push(`${i.toString().padStart(2, "0")}:00`)
      if (i < 17) {
        slots.push(`${i.toString().padStart(2, "0")}:30`)
      }
    }
    return slots
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time || !patientName || !reason) {
      toast.error("Missing Information", { description: "Please fill in all required fields." })
      return
    }

    const success = await createAppointment({
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate: date.toISOString(),
      appointmentTime: time,
      reason,
    })

    if (success) {
      // Clear form
      setPatientName("")
      setPatientEmail("")
      setPatientPhone("")
      setDate(new Date())
      setTime("")
      setReason("")
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
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
    </div>
  )
}
