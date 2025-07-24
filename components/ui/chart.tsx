"use client"

import { cn } from "@/lib/utils"

import * as React from "react"
import { CartesianGrid, Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Define common props for charts
interface ChartProps {
  data: Record<string, any>[]
  chartConfig: ChartConfig
  className?: string
  children?: React.ReactNode
}

// Line Chart Component
const CustomLineChart: React.FC<ChartProps> = ({ data, chartConfig, className, children }) => (
  <ChartContainer config={chartConfig} className={className}>
    <LineChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="month"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <Legend />
      {Object.entries(chartConfig).map(([key, { color, label, type }]) => {
        if (type === "line") {
          return <Line key={key} dataKey={key} stroke={`hsl(var(${color}))`} dot={false} name={label} />
        }
        return null
      })}
      {children}
    </LineChart>
  </ChartContainer>
)

// Bar Chart Component
const CustomBarChart: React.FC<ChartProps> = ({ data, chartConfig, className, children }) => (
  <ChartContainer config={chartConfig} className={className}>
    <BarChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
      <YAxis />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <Legend />
      {Object.entries(chartConfig).map(([key, { color, label, type }]) => {
        if (type === "bar") {
          return <Bar key={key} dataKey={key} fill={`hsl(var(${color}))`} radius={4} name={label} />
        }
        return null
      })}
      {children}
    </BarChart>
  </ChartContainer>
)

// Area Chart Component
const CustomAreaChart: React.FC<ChartProps> = ({ data, chartConfig, className, children }) => (
  <ChartContainer config={chartConfig} className={className}>
    <AreaChart accessibilityLayer data={data}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="date"
        tickLine={false}
        tickMargin={10}
        axisLine={false}
        tickFormatter={(value) => new Date(value).toLocaleDateString()}
      />
      <YAxis />
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <Legend />
      {Object.entries(chartConfig).map(([key, { color, label, type }]) => {
        if (type === "area") {
          return <Area key={key} dataKey={key} fill={`hsl(var(${color}))`} stroke={`hsl(var(${color}))`} name={label} />
        }
        return null
      })}
      {children}
    </AreaChart>
  </ChartContainer>
)

// Chart components for shadcn/ui
interface ChartContainerProps extends React.ComponentProps<typeof ChartContainer> {
  config: ChartConfig
}

const Chart = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps & {
    type?: "line" | "bar" | "area"
    title?: string
    description?: string
  }
>(({ type = "line", data, config, className, title, description, children, ...props }, ref) => {
  const ChartComponent = type === "line" ? CustomLineChart : type === "bar" ? CustomBarChart : CustomAreaChart

  return (
    <Card className={cn("w-full", className)} ref={ref}>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartComponent data={data || []} chartConfig={config}>
          {children}
        </ChartComponent>
      </CardContent>
    </Card>
  )
})
Chart.displayName = "Chart"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent }

export type { ChartConfig }
