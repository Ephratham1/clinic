"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointments } from "../context/AppointmentContext"
import { format } from "date-fns"
import { Loader2, Trash2, XCircle } from "lucide-react"
import { toast } from "@/components/ui/sonner"

export default function Appointments() {
  const { appointments, loading, error, updateAppointmentStatus, deleteAppointment, fetchAppointments } =
    useAppointments()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("asc") // 'asc' or 'desc'

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus === "all") return true
    return app.status === filterStatus
  })

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.appointmentDate).getTime()
    const dateB = new Date(b.appointmentDate).getTime()
    if (sortOrder === "asc") {
      return dateA - dateB
    } else {
      return dateB - dateA
    }
  })

  const handleStatusChange = async (id: string, newStatus: "scheduled" | "completed" | "cancelled") => {
    const success = await updateAppointmentStatus(id, newStatus)
    if (success) {
      toast.success("Status Updated", { description: `Appointment ${id} status changed to ${newStatus}` })
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      const success = await deleteAppointment(id)
      if (success) {
        toast.success("Appointment Deleted", { description: `Appointment ${id} has been removed.` })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-600 dark:text-gray-400">Loading appointments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Error Loading Appointments</h2>
        <p>{error}</p>
        <Button onClick={fetchAppointments} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-700 dark:text-gray-300">Filter by Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-gray-700 dark:text-gray-300">Sort by Date:</span>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Oldest First</SelectItem>
                  <SelectItem value="desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedAppointments.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
              No appointments found matching your criteria.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAppointments.map((appointment) => (
                <Card key={appointment._id} className="p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {appointment.patientName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(appointment.appointmentDate), "PPP")} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">Reason: {appointment.reason}</p>
                  {appointment.patientEmail && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email: {appointment.patientEmail}</p>
                  )}
                  {appointment.patientPhone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {appointment.patientPhone}</p>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Select
                      value={appointment.status}
                      onValueChange={(value: "scheduled" | "completed" | "cancelled") =>
                        handleStatusChange(appointment._id, value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Change Status" />
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
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
