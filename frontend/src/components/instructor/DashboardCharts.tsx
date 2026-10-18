"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis, Tooltip, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";



import { useLocale } from "next-intl";

const revenueConfig = {
  revenue: {
    label: "Revenus (KES)",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data?: any[] }) {
  const locale = useLocale();
  const isFrench = locale === "fr";

  const chartData = data?.length ? data : [
    { month: isFrench ? "Jan" : "Jan", revenue: 0 },
    { month: isFrench ? "Fév" : "Feb", revenue: 0 }
  ];

  let trend = 0;
  if (chartData.length >= 2) {
    const current = chartData[chartData.length - 1].revenue || 0;
    const previous = chartData[chartData.length - 2].revenue || 0;
    if (previous > 0) {
      trend = Math.round(((current - previous) / previous) * 100);
    } else if (current > 0) {
      trend = 100;
    }
  }

  return (
    <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm ring-0">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white/90">
          {isFrench ? "Revenus mensuels" : "Monthly Revenue"}
        </CardTitle>
        <CardDescription>
          {chartData.length > 1 
            ? `${chartData[0].month} - ${chartData[chartData.length - 1].month} 2026` 
            : (isFrench ? "Données récentes" : "Recent Data")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              className="fill-gray-500 dark:fill-white"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none text-gray-800 dark:text-white/90">
              {trend > 0 
                ? (isFrench ? `+${trend}% ce mois-ci` : `Up by ${trend}% this month`) 
                : trend < 0 
                  ? (isFrench ? `-${Math.abs(trend)}% ce mois-ci` : `Down by ${Math.abs(trend)}% this month`) 
                  : (isFrench ? "Stable ce mois-ci" : "No change this month")} 
              <TrendingUp className={`h-4 w-4 ${trend >= 0 ? "text-green-500" : "text-red-500 rotate-180"}`} />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">
              {isFrench ? "Comparé à la période précédente" : "Compared to the previous period"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

const enrollmentConfig = {
  enrollments: {
    label: "Inscriptions",
  },
} satisfies ChartConfig;

export function EnrollmentsChart({ data }: { data?: any[] }) {
  const locale = useLocale();
  const isFrench = locale === "fr";

  const chartData = data?.length ? data.map((d: any) => ({
    course: d.course,
    enrollments: d.learners,
    color: d.fill
  })) : [
    { course: isFrench ? "Aucun cours" : "No courses", enrollments: 0, color: "#3b82f6" }
  ];

  const totalEnrollments = chartData.reduce((acc, curr) => acc + curr.enrollments, 0);
  let topCourse = chartData[0];
  
  if (totalEnrollments > 0) {
    topCourse = chartData.reduce((prev, current) => 
      (prev.enrollments > current.enrollments) ? prev : current
    );
  }
  
  const topPercentage = totalEnrollments > 0 ? Math.round((topCourse.enrollments / totalEnrollments) * 100) : 0;

  return (
    <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm ring-0">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white/90">
          {isFrench ? "Inscriptions par cours" : "Enrollments per course"}
        </CardTitle>
        <CardDescription>
          {isFrench ? "Répartition des étudiants actifs" : "Distribution of active students"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={enrollmentConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <XAxis type="number" dataKey="enrollments" hide />
            <YAxis
              dataKey="course"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="fill-gray-500 dark:fill-white text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="enrollments" radius={4}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-gray-800 dark:text-white/90">
          {topPercentage > 0 
            ? (isFrench ? `${topCourse.course} est le plus populaire` : `${topCourse.course} is the most popular`) 
            : (isFrench ? "Aucune inscription pour le moment" : "No enrollments yet")} 
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-gray-500">
          {topPercentage > 0 
            ? (isFrench ? `Il représente plus de ${topPercentage}% des inscriptions totales.` : `It represents over ${topPercentage}% of total enrollments.`) 
            : (isFrench ? "Vos données apparaîtront dès que des étudiants s'inscriront." : "Your data will appear here once students enroll.")}
        </div>
      </CardFooter>
    </Card>
  );
}
