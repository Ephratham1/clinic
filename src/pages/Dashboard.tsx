"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useAppointments } from "../context/AppointmentContext"
import { format, parseISO } from "date-fns"
import { CheckCircleIcon, XCircleIcon, UsersIcon } from "lucide-react"
import { Loader2 } from "lucide-react" // Import Loader2
import { Button } from "@/components/ui/button" // Import Button

interface AppointmentData {
  date: string
  scheduled: number
  completed: number
  cancelled: number
}

export default function Dashboard() {
  const { appointments, loading, error, fetchAppointments } = useAppointments()
  const [chartData, setChartData] = useState<AppointmentData[]>([])
  const [totalAppointments, setTotalAppointments] = useState(0)
  const [completedAppointments, setCompletedAppointments] = useState(0)
  const [cancelledAppointments, setCancelledAppointments] = useState(0)

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  useEffect(() => {
    if (appointments.length > 0) {
      const dataMap = new Map<string, { scheduled: number; completed: number; cancelled: number }>()

      appointments.forEach((app) => {
        const dateKey = format(parseISO(app.appointmentDate), "yyyy-MM-dd")
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { scheduled: 0, completed: 0, cancelled: 0 })
        }
        const current = dataMap.get(dateKey)!
        if (app.status === "scheduled") {
          current.scheduled += 1
        } else if (app.status === "completed") {
          current.completed += 1
        } else if (app.status === "cancelled") {
          current.cancelled += 1
        }
      })

      const sortedData = Array.from(dataMap.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setChartData(sortedData)

      setTotalAppointments(appointments.length)
      setCompletedAppointments(appointments.filter((app) => app.status === "completed").length)
      setCancelledAppointments(appointments.filter((app) => app.status === "cancelled").length)
    }
  }, [appointments])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <XCircleIcon className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
        <p>{error}</p>
        <Button onClick={fetchAppointments} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const chartConfig = {
    scheduled: {
      label: "Scheduled",
      color: "hsl(var(--primary))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--green-500))", // Assuming green-500 is defined in your CSS vars
    },
    cancelled: {
      label: "Cancelled",
      color: "hsl(var(--red-500))", // Assuming red-500 is defined in your CSS vars
    },
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">Clinic Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All appointments recorded</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments}</div>
            <p className="text-xs text-muted-foreground">Successfully finished appointments</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Appointments</CardTitle>
            <XCircleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments that were cancelled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Appointments Overview
          </CardTitle>
          {/* <CardDescription>Daily breakdown of scheduled, completed, and cancelled appointments.</CardDescription> */}
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No data available for charts.</p>
          ) : (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={5}
                  />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend /> // Declare Legend
                  <Bar dataKey="scheduled" fill="hsl(var(--primary))" name="Scheduled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="hsl(var(--green-500))" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" fill="hsl(var(--red-500))" name="Cancelled" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
