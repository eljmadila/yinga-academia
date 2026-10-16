import React from 'react';
import { Award, BookOpen, BookX, PlayCircle, CheckCircle2, Clock } from 'lucide-react';
import { cookies } from "next/headers";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from '@/lib/api';

export default async function MyCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isFrench ? "Mes Formations" : "My Courses"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isFrench
              ? "Continuez votre apprentissage là où vous vous étiez arrêté"
              : "Continue learning where you left off"}
          </p>
        </div>
      </div>

      {enrollments.length > 0 ? (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    {isFrench ? "Détails de la formation" : "Course Details"}
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    {isFrench ? "Progression" : "Progress"}
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    {isFrench ? "Statut" : "Status"}
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">
                    {isFrench ? "Action" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {enrollments.map((enrollment) => {
                  const lessonId = enrollment.course_details.modules?.[0]?.lessons?.[0]?.id || enrollment.course_details.lessons?.[0]?.id || 1;
                  const isCompleted = enrollment.progress_percentage === 100;
                  
                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                            <img 
                              src={resolveMediaUrl(enrollment.course_details.thumbnail) || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80"} 
                              alt={enrollment.course_details.title} 
                              className="h-full w-full object-cover" 
                            />
                            {/* Mobile Play Overlay */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
                              <PlayCircle className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="max-w-[200px] md:max-w-[300px]">
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1" title={enrollment.course_details.title}>
                              {enrollment.course_details.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {isFrench ? "Par" : "By"} {enrollment.course_details.instructor_name || (isFrench ? "Instructeur" : "Instructor")}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 w-48">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className={isCompleted ? "text-green-600 dark:text-green-400" : "text-brand-600 dark:text-brand-400"}>
                              {enrollment.progress_percentage}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-brand-500'}`}
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          isCompleted 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {isCompleted ? (isFrench ? 'Terminé' : 'Completed') : (isFrench ? 'En cours' : 'In Progress')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end justify-center gap-2 sm:flex-row sm:items-center">
                          <Link 
                            href={`/student/courses/${enrollment.course_details.id}/lesson/${lessonId}`}
                            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                              isCompleted
                                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                : 'bg-brand-500 hover:bg-brand-600 text-white'
                            }`}
                          >
                            {isCompleted ? (isFrench ? "Revoir le cours" : "Review Course") : (isFrench ? "Continuer" : "Resume")}
                          </Link>
                          {isCompleted && (
                            <Link
                              href={`/student/courses/${enrollment.course_details.id}/certificate`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400 hover:underline"
                            >
                              <Award className="h-4 w-4" />
                              {isFrench ? "Certificat" : "Certificate"}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 col-span-full min-h-[300px]">
            <BookX className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {isFrench ? "Aucun cours pour le moment" : "No courses yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {isFrench
                ? "Vous n'êtes inscrit à aucun cours pour l'instant. Parcourez notre catalogue pour découvrir de nouvelles compétences."
                : "You haven't enrolled in any courses yet. Browse our catalog to find something new to learn."}
            </p>
            <Link href="/student/catalog" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {isFrench ? "Parcourir le catalogue" : "Browse Catalog"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}