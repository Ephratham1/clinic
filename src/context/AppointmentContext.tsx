"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Appointment {
  id: string
  patientName: string
  email: string
  phone: string
  doctor: string
  specialty: string
  date: string
  time: string
  reason: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  createdAt: string
}

interface AppointmentContextType {
  appointments: Appointment[]
  addAppointment: (appointment: Appointment) => void
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void
  deleteAppointment: (id: string) => void
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

export const useAppointments = () => {
  const context = useContext(AppointmentContext)
  if (!context) {
    throw new Error("useAppointments must be used within an AppointmentProvider")
  }
  return context
}

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // Load appointments from localStorage on mount
  useEffect(() => {
    const savedAppointments = localStorage.getItem("clinic-appointments")
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments))
    } else {
      // Add some sample data for demonstration
      const sampleAppointments: Appointment[] = [
        {
          id: "1",
          patientName: "John Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
          doctor: "Dr. Sarah Smith",
          specialty: "General Medicine",
          date: "2024-01-15",
          time: "10:00",
          reason: "Annual checkup",
          status: "scheduled",
          createdAt: "2024-01-10T10:00:00Z",
        },
        {
          id: "2",
          patientName: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "(555) 987-6543",
          doctor: "Dr. Michael Johnson",
          specialty: "Cardiology",
          date: "2024-01-12",
          time: "14:30",
          reason: "Heart palpitations",
          status: "completed",
          createdAt: "2024-01-08T14:30:00Z",
        },
      ]
      setAppointments(sampleAppointments)
    }
  }, [])

  // Save appointments to localStorage whenever appointments change
  useEffect(() => {
    localStorage.setItem("clinic-appointments", JSON.stringify(appointments))
  }, [appointments])

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment])
  }

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment)),
    )
  }

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id))
  }

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  )
}
