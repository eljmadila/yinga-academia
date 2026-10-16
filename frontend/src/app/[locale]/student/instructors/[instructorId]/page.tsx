import React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, BookOpen, Star, Users, Globe, Award, Mail } from "lucide-react";
import { resolveApiUrl, resolveMediaUrl } from "@/lib/api";
import { setRequestLocale } from "next-intl/server";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface InstructorPageProps {
  params: Promise<{ locale: string; instructorId: string }>;
}

export default async function InstructorProfilePage({ params }: InstructorPageProps) {
  const { locale, instructorId } = await params;
  setRequestLocale(locale);
  const isFrench = locale === "fr";

  let instructor: any = null;
  let courses: any[] = [];

  try {
    const [instRes, coursesRes] = await Promise.all([
      fetch(resolveApiUrl(`/auth/instructors/${instructorId}/`), { next: { revalidate: 60 } }),
      fetch(resolveApiUrl(`/courses/?instructor=${instructorId}`), { next: { revalidate: 60 } })
    ]);

    if (instRes.ok) {
      instructor = await instRes.json();
    }
    if (coursesRes.ok) {
      const data = await coursesRes.json();
      courses = Array.isArray(data) ? data : data.results || [];
    }
  } catch (err) {
    console.error("Error fetching instructor details:", err);
  }

  if (!instructor) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isFrench ? "Instructeur introuvable" : "Instructor not found"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isFrench 
            ? "Ce profil d'instructeur n'existe pas ou a été désactivé."
            : "This instructor profile does not exist or has been disabled."}
        </p>
        <Link
          href="/student/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isFrench ? "Retour au catalogue" : "Back to catalog"}
        </Link>
      </div>
    );
  }

  const fullName = `${instructor.first_name || ""} ${instructor.last_name || ""}`.trim() || instructor.username;
  const headline = instructor.title || (isFrench ? "Instructeur Yinga Academia" : "Yinga Academia Instructor");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/student/catalog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isFrench ? "Retour au catalogue" : "Back to catalog"}
        </Link>
      </div>

      {/* Instructor Banner Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-600 text-white font-bold text-4xl flex items-center justify-center shrink-0 overflow-hidden shadow-md">
            {instructor.avatar ? (
              <img
                src={resolveMediaUrl(instructor.avatar)}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{fullName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                <p className="text-brand-600 dark:text-brand-400 font-medium text-base mt-0.5">{headline}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-xs font-semibold self-center sm:self-start">
                <Award className="w-3.5 h-3.5" />
                {isFrench ? "Instructeur Vérifié" : "Verified Instructor"}
              </span>
            </div>

            {/* Social links */}
            {instructor.social_links && (
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                {instructor.social_links.website && (
                  <a
                    href={instructor.social_links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {instructor.social_links.twitter && (
                  <a
                    href={instructor.social_links.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                )}
                {instructor.social_links.linkedin && (
                  <a
                    href={instructor.social_links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {instructor.bio && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
              {isFrench ? "À propos de l'instructeur" : "About the Instructor"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {instructor.bio}
            </p>
          </div>
        )}
      </div>

      {/* Courses by Instructor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isFrench ? `Formations proposées (${courses.length})` : `Courses by ${fullName} (${courses.length})`}
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center text-gray-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {isFrench ? "Aucun cours public pour le moment." : "No published courses yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={resolveMediaUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                    {parseFloat(course.price) === 0 ? (isFrench ? "Gratuit" : "Free") : `€${course.price}`}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-2 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      {course.enrollment_count || 0} {isFrench ? "étudiants" : "students"}
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400 group-hover:underline">
                      {isFrench ? "Voir la formation →" : "View course →"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
