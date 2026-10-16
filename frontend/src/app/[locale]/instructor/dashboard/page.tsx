import React from "react";
import Link from "next/link";
import { Users, BookOpen, Star, TrendingUp, Search } from "lucide-react";
import type { Metadata } from "next";
import { RevenueChart, EnrollmentsChart } from "@/components/instructor/DashboardCharts";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import LatestStudentsTable from "./LatestStudentsTable";

export const metadata: Metadata = {
  title: "Tableau de Bord Instructeur | Yinga Academia",
  description: "Vue d'ensemble de vos performances",
};

export default async function InstructorDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";
  const t = await getTranslations("instructorDashboard");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let stats: any = {
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    coursePerformance: [],
    recentTransactions: [],
    latestStudents: [],
    monthlyHistory: [],
    recentReviews: [],
    averageRating: 0,
  };

  try {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://yinga-backend.onrender.com/api"
        : "http://localhost:8000/api");
    const res = await fetch(`${API_BASE}/analytics/instructor/`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      next: { revalidate: 0 }
    });
    
    if (res.ok) {
      stats = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch analytics", err);
  }

  const {
    totalStudents,
    activeCourses,
    totalRevenue,
    monthlyRevenue,
    coursePerformance,
    latestStudents,
    monthlyHistory,
    recentReviews,
    averageRating
  } = stats;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <Link 
          href="/instructor/create-course"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 shadow-sm"
        >
          + {t("createCourse")}
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{totalStudents}</h4>
            <p className="text-sm font-medium text-gray-500 mt-1">{t("totalStudents")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{activeCourses}</h4>
            <p className="text-sm font-medium text-gray-500 mt-1">{t("activeCourses")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <span className="text-xl font-bold">€</span>
            </div>
            {monthlyRevenue > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                <TrendingUp className="h-4 w-4" /> 
              </span>
            )}
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">€{totalRevenue.toFixed(2)}</h4>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {t("monthlyRevenue")} ({isFrench ? `${monthlyRevenue.toFixed(2)} € ce mois` : `€${monthlyRevenue.toFixed(2)} this month`})
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{averageRating.toFixed(1)}/5</h4>
            <p className="text-sm font-medium text-gray-500 mt-1">{t("averageRating")}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={monthlyHistory} />
        <EnrollmentsChart data={coursePerformance} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table: Derniers Inscrits */}
        <LatestStudentsTable latestStudents={latestStudents} />

        {/* Côté Droit - Feedback Récent ou Activité */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-6">{t("recentReviews")}</h3>
          
          <div className="space-y-6">
            {recentReviews.length > 0 ? recentReviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 dark:border-gray-800 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-3">&quot;{review.comment}&quot;</p>
                <p className="text-xs text-gray-500 mt-2">
                  {review.student_name} {isFrench ? "sur" : "on"} <span className="font-semibold text-gray-700 dark:text-gray-300">{review.course_title}</span>
                </p>
              </div>
            )) : (
              <div className="text-center py-8">
                <Star className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {isFrench ? "Aucun avis pour le moment." : "No reviews yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
