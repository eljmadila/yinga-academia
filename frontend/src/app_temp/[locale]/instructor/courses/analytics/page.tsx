"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Wallet, TrendingUp, CreditCard, ArrowRight, Download, Filter } from "lucide-react";
import { SalesPerformanceChart, RevenueDistributionChart } from "@/components/instructor/AnalyticsCharts";
import { fetchApi } from "@/lib/api";
import { useTranslations } from "next-intl";
import { PageLoader } from "@/components/ui/PageLoader";

export default function SalesAnalyticsPage() {
  const t = useTranslations("instructor.analytics");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetchApi("/analytics/instructor/");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  const {
    totalStudents = 0,
    totalRevenue = 0,
    monthlyRevenue = 0,
    activeCourses = 0,
    coursePerformance = [],
    recentTransactions = [],
    monthlyHistory = []
  } = data || {};
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800/50">
            <Filter className="h-4 w-4" />
            {t("filterByDate")}
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600">
            <Wallet className="h-4 w-4" />
            {t("requestPayout")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="absolute -mr-4 -mt-4 h-24 w-24 rounded-bl-full bg-brand-500/10 right-0 top-0" />
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{t("availableBalance")}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{(totalRevenue * 0.38).toFixed(2)}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +24%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{t("totalRevenue")}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{t("pendingPayouts")}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{(totalRevenue * 0.08).toFixed(2)}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{t("learnersEnrolled")}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">{totalStudents}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPerformanceChart data={monthlyHistory} />
        </div>
        <div className="xl:col-span-1">
          <RevenueDistributionChart data={coursePerformance} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">{t("recentTransactions")}</h3>
            <p className="text-sm text-gray-500">{t("recentTransactionsDesc")}</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600">
            <Download className="h-4 w-4" />
            {t("exportCsv")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">{t("table.transactionId")}</th>
                <th className="px-6 py-4 font-semibold">{t("table.studentCourse")}</th>
                <th className="px-6 py-4 font-semibold">{t("table.amount")}</th>
                <th className="px-6 py-4 font-semibold">{t("table.method")}</th>
                <th className="px-6 py-4 font-semibold">{t("table.date")}</th>
                <th className="px-6 py-4 text-right font-semibold">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentTransactions.map((trx: any) => (
                <tr key={trx.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">{trx.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800 dark:text-white/90">{trx.student}</div>
                    <div className="text-xs text-gray-500">{trx.course}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white/90">€{trx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{trx.method}</td>
                  <td className="px-6 py-4">{trx.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      trx.status === "Success"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : trx.status === "Pending"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
          <button className="flex w-full items-center justify-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600">
            {t("viewFullHistory")} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
