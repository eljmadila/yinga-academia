"use client";

import { Pie, PieChart, CartesianGrid, XAxis, YAxis, Legend, Line, Bar, ComposedChart, Cell, Area, AreaChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";



const performanceConfig = {
  revenue: {
    label: "Course revenue (€)",
    color: "#2563eb",
  },
  target: {
    label: "Target (€)",
    color: "#93c5fd",
  },
} satisfies ChartConfig;

export function SalesPerformanceChart({ data }: { data?: any[] }) {
  const chartData = data?.length ? data.map(d => ({
    ...d,
    target: d.revenue > 0 ? d.revenue * 1.1 : 100 // Add a dummy target for the visual line
  })) : [
    { month: "Jan", revenue: 0, target: 100 },
    { month: "Feb", revenue: 0, target: 100 }
  ];

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm ring-0 dark:border-gray-800 dark:bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white/90">Revenue performance</CardTitle>
        <CardDescription>Monthly revenue from enrolled course payments compared with target.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={performanceConfig} className="aspect-[2/1]">
          <ComposedChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-gray-500 dark:fill-white"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-gray-500 dark:fill-white"
              tickFormatter={(value) => `€${value}`}
            />
            <ChartTooltip
              cursor={{ fill: "#dbeafe", opacity: 0.1 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} barSize={32} />
            <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-target)" }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueAreaChart({ data }: { data?: any[] }) {
  // AreaChart needs at least 2 points to draw a curve.
  // If we only have 1 data point (e.g. "Last 30 Days"), duplicate it so the area paints.
  const chartData = data?.length 
    ? (data.length === 1 ? [data[0], data[0]] : data)
    : [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 }
      ];

  return (
    <ChartContainer config={performanceConfig} className="aspect-[2.5/1] min-h-[250px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
      >
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="fill-gray-500 dark:fill-white"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="fill-gray-500 dark:fill-white"
          tickFormatter={(value) => `€${value}`}
        />
        <ChartTooltip
          cursor={{ stroke: "#dbeafe", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={3}
          fill="url(#fillRevenue)"
        />
      </AreaChart>
    </ChartContainer>
  );
}


export function RevenueDistributionChart({ data }: { data: Array<{ course: string; revenue: number; learners: number; completionRate: number; fill: string }> }) {
  const distributionConfig = {
    revenue: {
      label: "Revenue",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm ring-0 dark:border-gray-800 dark:bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white/90">Revenue split</CardTitle>
        <CardDescription>Distribution by published course</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <ChartContainer config={distributionConfig} className="mx-auto aspect-square min-h-[300px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="course"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={4}
              stroke="white"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-white dark:stroke-gray-950" />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
