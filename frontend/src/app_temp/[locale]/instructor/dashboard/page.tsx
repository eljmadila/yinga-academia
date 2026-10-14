"use client";

import React, { useEffect, useState } from "react";
import { Users, BookOpen, Star, TrendingUp, MoreVertical, Search } from "lucide-react";
import { RevenueChart, EnrollmentsChart } from "@/components/instructor/DashboardCharts";
import { useTranslations, useLocale } from "next-intl";
import { fetchApi } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InstructorDashboard() {
  const t = useTranslations("instructorDashboard");
  const locale = useLocale();
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

  const {
    totalStudents = 0,
    totalRevenue = 0,
    monthlyRevenue = 0,
    activeCourses = 0,
    latestStudents = [],
    monthlyHistory = [],
    coursePerformance = [],
    recentReviews = []
  } = data || {};
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>
        <a 
          href={`/${locale}/instructor/create-course`}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          + {t("createCourse")}
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +12%
            </span>
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
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +1
            </span>
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
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +18%
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">{monthlyRevenue.toFixed(2)} €</h4>
            <p className="text-sm font-medium text-gray-500 mt-1">{t("monthlyRevenue")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
              <Star className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
              {t("stable")}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-gray-800 dark:text-white/90">4.8/5</h4>
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
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">{t("latestStudents")}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={t("search")}
                className="rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500"
              />
            </div>
          </div>
          
          
          {latestStudents.length === 0 ? (
            <div className="p-6">
              <EmptyState 
                icon={Users}
                title="Aucun étudiant pour le moment"
                description="Les derniers étudiants inscrits à vos cours apparaîtront ici."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t("student")}</th>
                    <th className="px-6 py-4 font-semibold">{t("course")}</th>
                    <th className="px-6 py-4 font-semibold">{t("progress")}</th>
                    <th className="px-6 py-4 font-semibold">{t("date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {latestStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-bold uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white/90">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.course}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[80px]">
                            <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${student.progress}%` }}></div>
                          </div>
                          <span className="text-xs">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{student.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Côté Droit - Feedback Récent ou Activité */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-6">{t("recentReviews")}</h3>
          
          <div className="space-y-6">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun avis récent.</p>
            ) : (
              recentReviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">&quot;{review.comment || 'Sans commentaire'}&quot;</p>
                  <p className="text-xs text-gray-500 mt-1">{review.student_name} sur {review.course_title}</p>
                </div>
              ))
            )}
            
            <a href="#" className="block text-center text-sm font-medium text-brand-500 hover:text-brand-600">{t("seeAllReviews")}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
