"use client"

import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from "react"
import { toast } from "@/components/ui/sonner"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"

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

interface AppointmentContextType {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  fetchAppointments: () => Promise<void>
  createAppointment: (newAppointment: Omit<Appointment, "_id" | "status" | "createdAt">) => Promise<boolean>
  updateAppointmentStatus: (id: string, status: "scheduled" | "completed" | "cancelled") => Promise<boolean>
  deleteAppointment: (id: string) => Promise<boolean>
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined)

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchAppointments = useCallback(async () => {
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
  }, [API_URL])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const createAppointment = async (
    newAppointment: Omit<Appointment, "_id" | "status" | "createdAt">,
  ): Promise<boolean> => {
    setError(null)
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
        description: `Appointment for ${newAppointment.patientName} has been scheduled.`,
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      })
      fetchAppointments()
      return true
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to book appointment", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
      return false
    }
  }

  const updateAppointmentStatus = async (
    id: string,
    status: "scheduled" | "completed" | "cancelled",
  ): Promise<boolean> => {
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/v1/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      toast.success("Appointment Status Updated!", {
        description: `Appointment status changed to ${status}.`,
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      })
      fetchAppointments()
      return true
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to update status", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
      return false
    }
  }

  const deleteAppointment = async (id: string): Promise<boolean> => {
    setError(null)
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
      fetchAppointments()
      return true
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to delete appointment", {
        description: err.message,
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      })
      return false
    }
  }

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
        updateAppointmentStatus,
        deleteAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  )
}

export const useAppointments = () => {
  const context = useContext(AppointmentContext)
  if (context === undefined) {
    throw new Error("useAppointments must be used within an AppointmentProvider")
  }
  return context
}
