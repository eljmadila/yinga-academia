import { PlayCircle, Award, Clock, BookOpen, ChevronRight, BookX } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tableau de Bord Étudiant | Yinga Academia",
  description: "Votre espace d'apprentissage personnel",
};

export default async function StudentDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";
  const t = await getTranslations("studentDashboard");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const userNameCookie = cookieStore.get("user_name")?.value;
  const userName = userNameCookie ? decodeURIComponent(userNameCookie) : "";

  let enrollments: any[] = [];
  try {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://yinga-backend.onrender.com/api"
        : "http://localhost:8000/api");
    const res = await fetch(`${API_BASE}/enrollments/`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      next: { revalidate: 0 }
    });
    if (res.ok) {
      enrollments = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch enrollments", err);
  }

  const completedCount = enrollments.filter(e => e.progress_percentage === 100).length;
  const inProgressEnrollments = enrollments.filter(e => e.progress_percentage < 100);
  const recentEnrollment = enrollments.length > 0 ? enrollments[0] : null;

  // Calculate approximate learning hours based on enrolled courses total duration
  let totalMinutes = 0;
  enrollments.forEach(e => {
    // Some endpoints might return lessons inside modules
    if (e.course_details?.modules) {
      e.course_details.modules.forEach((m: any) => {
        if (m.lessons) {
          m.lessons.forEach((l: any) => {
            totalMinutes += (l.duration_minutes || 0);
          });
        }
      });
    }
    // Or standalone lessons
    if (e.course_details?.lessons) {
      e.course_details.lessons.forEach((l: any) => {
        totalMinutes += (l.duration_minutes || 0);
      });
    }
  });
  
  const learningHours = Math.round(totalMinutes / 60);

  return (
    <div className="space-y-6">
      {/* Héro Section - Bienvenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
          {t("greeting")}{userName ? ` ${userName}` : ""} 👋
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t("welcome")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Colonne Principale (2/3) */}
        <div className="space-y-6 xl:col-span-2">
          
          {/* Reprendre l'apprentissage */}
          {recentEnrollment ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 dark:border-brand-900/30 dark:bg-brand-900/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t("resume")}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-xl bg-gray-200 relative group">
                  <img 
                    src={recentEnrollment.course_details.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80"} 
                    alt={recentEnrollment.course_details.title}
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                    <PlayCircle className="text-white w-12 h-12" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {recentEnrollment.course_details.category?.name || t("category")}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {recentEnrollment.course_details.title}
                  </h3>
                  <div className="flex items-center gap-4 pt-2">
                    <Link 
                      href={`/student/courses/${recentEnrollment.course_details.id}/lesson/${recentEnrollment.course_details.modules?.[0]?.lessons?.[0]?.id || recentEnrollment.course_details.lessons?.[0]?.id || 1}`}
                      className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                    >
                      <PlayCircle className="h-5 w-5" />
                      {t("continue")}
                    </Link>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {recentEnrollment.progress_percentage}% {t("completedCourses").replace(/s$/, '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/30">
              <BookX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isFrench ? "Aucun cours pour le moment" : "No courses yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {isFrench
                  ? "Vous n'êtes inscrit à aucun cours pour l'instant. Explorez notre catalogue pour commencer à apprendre !"
                  : "You haven't enrolled in any courses yet. Explore our catalog to start learning!"}
              </p>
              <Link href="/student/catalog" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600">
                <BookOpen className="h-4 w-4" /> {isFrench ? "Parcourir le catalogue" : "Browse Catalog"}
              </Link>
            </div>
          )}

          {/* Cours en cours */}
          {inProgressEnrollments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t("inProgress")}</h2>
                <Link href="/student/courses" className="text-sm font-medium text-brand-500 hover:text-brand-600 flex items-center">
                  {t("viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgressEnrollments.slice(0, 4).map((enrollment) => (
                  <div key={enrollment.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] transition-shadow hover:shadow-lg">
                    <img 
                      src={enrollment.course_details.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"} 
                      alt={enrollment.course_details.title} 
                      className="h-40 w-full rounded-xl object-cover mb-4" 
                    />
                    <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-1 line-clamp-1" title={enrollment.course_details.title}>
                      {enrollment.course_details.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {enrollment.course_details.instructor_name || t("bySarah")}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700 dark:text-gray-300">{t("progress")}</span>
                        <span className="text-brand-500">{enrollment.progress_percentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${enrollment.progress_percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne Latérale (1/3) - Statistiques */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{t("quickOverview")}</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("completedCourses")}</p>
                <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">{completedCount}</h4>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("learningHours")}</p>
                <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">{learningHours}h</h4>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("badges")}</p>
                <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">{completedCount > 0 ? 1 : 0}</h4>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
