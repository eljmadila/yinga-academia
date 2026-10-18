import React from 'react';
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Link } from "@/i18n/navigation";
import {
  PlayCircle, Clock, Award, BookOpen, CheckCircle, ChevronRight, Play, FileText,
  Lock, Star, Users, Signal, Target, MessageCircle, Download, Video, User,
} from 'lucide-react';
import EnrollButton from "./EnrollButton";
import { resolveMediaUrl } from "@/lib/api";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api")
).trim().replace(/\/+$/, "");

async function getJson(url: string, token?: string) {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    // If backend rejects the token with 401 (expired/invalid JWT), retry anonymously for public endpoints
    if (res.status === 401 && token) {
      const publicRes = await fetch(url, { cache: "no-store" });
      return publicRes.ok ? await publicRes.json() : null;
    }
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error(`Failed to fetch ${url}`, err);
    return null;
  }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default async function CourseOverviewPage({ 
  params 
}: { 
  params: Promise<{ locale: string; courseId: string }> 
}) {
  const { locale, courseId } = await params;
  const isFrench = locale === "fr";
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const [course, enrollments, progressList, reviews] = await Promise.all([
    getJson(`${API_URL}/courses/${courseId}/`, token),
    token ? getJson(`${API_URL}/enrollments/`, token) : null,
    token ? getJson(`${API_URL}/progress/by_course/?course_id=${courseId}`, token) : null,
    getJson(`${API_URL}/reviews/?course_id=${courseId}`),
  ]);

  if (!course) return notFound();

  const enrollment = Array.isArray(enrollments)
    ? enrollments.find((e: any) => String(e.course) === String(course.id) || String(e.course_details?.id) === String(course.id))
    : null;
  const isEnrolled = Boolean(enrollment) || course.is_enrolled;
  const progress = enrollment?.progress_percentage || 0;
  const isCompleted = enrollment?.status === "COMPLETED";

  const completedLessonIds = new Set<string>(
    Array.isArray(progressList) ? progressList.map((p: any) => String(p.lesson)) : []
  );

  // Build syllabus: modules (ordered) + lessons not attached to any module
  const modules: any[] = [...(course.modules || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const orphanLessons = (course.lessons || []).filter((l: any) => !l.module);
  if (orphanLessons.length > 0) {
    modules.push({ id: "orphan", title: isFrench ? "Leçons supplémentaires" : "Additional lessons", lessons: orphanLessons });
  }
  const allLessons: any[] = modules.flatMap((m) => m.lessons || []);

  const totalLessons = allLessons.length;
  const totalDuration = allLessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  const totalVideos = allLessons.filter((l) => l.video_url || l.video_media?.length).length;

  // Resume at first uncompleted lesson, otherwise the first lesson
  const nextLesson = allLessons.find((l) => !completedLessonIds.has(String(l.id))) || allLessons[0];

  const instructor = course.instructor || {};
  const instructorName = `${instructor.first_name || ""} ${instructor.last_name || ""}`.trim() || (isFrench ? "Formateur" : "Instructor");
  const objectives: string[] = Array.isArray(course.learning_objectives) ? course.learning_objectives.filter(Boolean) : [];
  const includes: string[] = Array.from(new Set([
    "CERTIFICATE",
    ...(Array.isArray(course.course_includes) ? course.course_includes : []),
  ]));
  const reviewList: any[] = Array.isArray(reviews) ? reviews : [];
  const price = Number(course.price) || 0;

  const levelLabels: Record<string, string> = {
    BEGINNER: isFrench ? "Débutant" : "Beginner",
    INTERMEDIATE: isFrench ? "Intermédiaire" : "Intermediate",
    ADVANCED: isFrench ? "Avancé" : "Advanced",
  };

  const includesMap: Record<string, { label: string; icon: React.ElementType }> = {
    LIFETIME_ACCESS: { label: isFrench ? "Accès à vie complet" : "Full lifetime access", icon: CheckCircle },
    CERTIFICATE: { label: isFrench ? "Certificat de fin de formation" : "Certificate of completion", icon: Award },
    DOWNLOADABLE_RESOURCES: { label: isFrench ? "Ressources téléchargeables" : "Downloadable resources", icon: Download },
    COMMUNITY_SUPPORT: { label: isFrench ? "Support de la communauté" : "Community support", icon: Users },
    LIVE_QA: { label: isFrench ? "Sessions Q&R en direct" : "Live Q&A sessions", icon: MessageCircle },
    PROJECT_REVIEW: { label: isFrench ? "Revue de projets pratiques" : "Project review", icon: FileText },
    ONE_ON_ONE: { label: isFrench ? "Mentorat individuel" : "One-on-one mentoring", icon: User },
    QUIZZES: { label: isFrench ? "Quiz et exercices pratiques" : "Quizzes & exercises", icon: Target },
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto gap-8 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href={isEnrolled ? "/student/courses" : "/student/catalog"} className="hover:text-brand-600 dark:hover:text-brand-400">
          {isEnrolled ? (isFrench ? "Mes Formations" : "My Courses") : (isFrench ? "Catalogue" : "Catalog")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium line-clamp-1">{course.title}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div className="md:w-5/12 lg:w-1/3 relative bg-gray-200 dark:bg-gray-900 min-h-[250px]">
          {course.thumbnail ? (
            <img 
              src={resolveMediaUrl(course.thumbnail)} 
              alt={course.title} 
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800">
              <BookOpen className="w-16 h-16 text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 gap-2">
            {course.category && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                {typeof course.category === "object" ? course.category?.name : course.category}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {isFrench ? "Par" : "By"} <span className="font-semibold text-gray-900 dark:text-gray-200">{instructorName}</span>
            {instructor.title && <span className="text-gray-500"> · {instructor.title}</span>}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {course.reviews_count > 0 ? course.average_rating : (isFrench ? "Nouveau" : "New")}
              </span>
              {course.reviews_count > 0 && <span>({course.reviews_count} {isFrench ? "avis" : "reviews"})</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{course.enrollments_count || 0} {isFrench ? "étudiants" : "students"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-teal-500" />
              <span>{levelLabels[course.level] || course.level}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>{totalLessons} {isFrench ? "leçons" : "lessons"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
            {isEnrolled ? (
              <>
                {nextLesson ? (
                  <Link 
                    id="start-course-btn"
                    href={`/student/courses/${course.id}/lesson/${nextLesson.id}`}
                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    {isCompleted
                      ? (isFrench ? "Revoir le cours" : "Review Course")
                      : progress > 0
                        ? (isFrench ? "Reprendre le cours" : "Resume Course")
                        : (isFrench ? "Commencer le cours" : "Start Learning")}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-500">
                    {isFrench ? "Aucune leçon publiée pour l'instant." : "No lessons published yet."}
                  </span>
                )}

                <div className="w-full sm:flex-1 max-w-xs space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700 dark:text-gray-300">
                      {isFrench ? "Votre progression" : "Your Progress"}
                    </span>
                    <span className="text-brand-600 dark:text-brand-400">{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {completedLessonIds.size} {isFrench ? "sur" : "of"} {totalLessons} {isFrench ? "leçons terminées" : "lessons completed"}
                  </p>
                </div>

                {isCompleted && (
                  <Link
                    href={`/student/courses/${course.id}/certificate`}
                    className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
                  >
                    <Award className="w-5 h-5" /> {isFrench ? "Certificat" : "Certificate"}
                  </Link>
                )}
              </>
            ) : (
              <EnrollButton courseId={String(course.id)} price={price} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Learning objectives */}
          {objectives.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isFrench ? "Ce que vous allez apprendre" : "What You'll Learn"}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isFrench ? "À propos de ce cours" : "About This Course"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {course.description || (isFrench ? "Aucune description fournie pour ce cours." : "No description provided for this course.")}
            </p>
          </div>

          {/* Syllabus */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isFrench ? "Programme de la formation" : "Course Syllabus"}
              </h2>
              <span className="text-sm text-gray-500">
                {modules.length} {isFrench ? "sections" : "sections"} · {totalLessons} {isFrench ? "leçons" : "lessons"} · {formatDuration(totalDuration)}
              </span>
            </div>
            {modules.length === 0 ? (
              <p className="text-sm text-gray-500">
                {isFrench ? "Le programme de ce cours n'est pas encore disponible." : "The syllabus for this course is not available yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {modules.map((module: any, idx: number) => {
                  const lessons = [...(module.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const moduleDuration = lessons.reduce((a: number, l: any) => a + (l.duration_minutes || 0), 0);
                  return (
                    <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4 md:p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {isFrench ? "Section" : "Section"} {idx + 1}: {module.title}
                          </h3>
                          {module.description && <p className="text-sm text-gray-500 mt-1">{module.description}</p>}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {lessons.length} {isFrench ? "leçons" : "lessons"} · {formatDuration(moduleDuration)}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        {lessons.map((lesson: any) => {
                          const done = completedLessonIds.has(String(lesson.id));
                          const accessible = isEnrolled || lesson.is_free_preview;
                          const row = (
                            <>
                              {done ? (
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : accessible ? (
                                (lesson.video_url || lesson.video_media?.length) ? <Play className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-medium flex-1 ${done ? "text-gray-500 line-through decoration-gray-300" : "text-gray-700 dark:text-gray-200"}`}>
                                {lesson.title}
                              </span>
                              {lesson.is_free_preview && !isEnrolled && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded">
                                  {isFrench ? "Aperçu" : "Preview"}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{lesson.duration_minutes || 0} min</span>
                            </>
                          );
                          const cls = "flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0 transition-colors";
                          return accessible ? (
                            <Link key={lesson.id} href={`/student/courses/${course.id}/lesson/${lesson.id}`} className={`${cls} hover:bg-gray-50 dark:hover:bg-gray-700/40`}>
                              {row}
                            </Link>
                          ) : (
                            <div key={lesson.id} className={`${cls} cursor-not-allowed`}>{row}</div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {isFrench ? "Avis des étudiants" : "Student Reviews"} {reviewList.length > 0 && <span className="text-gray-400 font-normal">({reviewList.length})</span>}
            </h2>
            {reviewList.length === 0 ? (
              <p className="text-sm text-gray-500">
                {isFrench ? "Aucun avis pour l'instant. Soyez le premier !" : "No reviews yet. Be the first!"}
              </p>
            ) : (
              <div className="space-y-5">
                {reviewList.slice(0, 5).map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 dark:border-gray-700/50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{r.student_name}</span>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {isFrench ? "Cette formation comprend" : "This Course Includes"}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Video className="w-5 h-5 text-gray-400" />
                <span>{totalVideos} {isFrench ? "leçons vidéo" : "video lessons"} ({formatDuration(totalDuration)})</span>
              </li>
              {includes.map((key) => {
                const item = includesMap[key];
                if (!item) return null;
                const Icon = item.icon;
                return (
                  <li key={key} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instructor */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {isFrench ? "Votre Formateur" : "Your Instructor"}
            </h3>
            <div className="flex items-center gap-3 mb-4">
              {instructor.avatar ? (
                <img src={instructor.avatar} alt={instructorName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold">
                  {instructorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{instructorName}</p>
                <p className="text-xs text-gray-500">{instructor.title || instructor.profile?.specialty || ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{instructor.average_rating || "–"}</p>
                <p className="text-[11px] text-gray-500">{isFrench ? "Note" : "Rating"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{instructor.total_students ?? 0}</p>
                <p className="text-[11px] text-gray-500">{isFrench ? "Étudiants" : "Students"}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{instructor.total_courses ?? 0}</p>
                <p className="text-[11px] text-gray-500">{isFrench ? "Formations" : "Courses"}</p>
              </div>
            </div>
            {instructor.bio && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">{instructor.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
