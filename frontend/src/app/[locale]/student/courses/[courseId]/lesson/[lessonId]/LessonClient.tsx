"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle, CheckCircle, Circle, ChevronDown, ChevronUp, MessageSquare, FileText,
  ChevronLeft, ChevronRight, Award, Clock, Lock, BookOpen, StickyNote, Trash2, Send, Loader2, X, CheckCircle2,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import VideoPlayer, { VideoPlayerHandle, formatTime } from './VideoPlayer';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api");
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com"
    : "http://localhost:8000");
const AUTO_COMPLETE_RATIO = 0.9;   // mark complete after 90% watched
const SAVE_INTERVAL_SEC = 10;      // persist timecode every 10s of playback
const NEXT_COUNTDOWN_SEC = 5;

interface ProgressEntry { is_completed: boolean; current_timecode: number }

interface LessonClientProps {
  course: any;
  modules: any[];
  initialLessonId: string;
  initialProgress: any[];
  isEnrolled: boolean;
}

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = getCookieValue("access_token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

/** Turns relative media paths (e.g. /media/videos/x.mp4) into absolute backend URLs. */
const resolveMediaUrl = (u?: string | null) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${BACKEND_ORIGIN}${u.startsWith("/") ? "" : "/"}${u}`;
};

const getLessonVideo = (lesson: any, token?: string) => {
  const raw =
    resolveMediaUrl(lesson?.video_file) ||
    resolveMediaUrl(lesson?.video_url) ||
    resolveMediaUrl(lesson?.video_media?.[0]?.video_url) ||
    null;
  if (!raw) return null;
  // If it's a backend /media/ URL and we have an auth token, attach ?token= for HTML5 <video> authentication
  if (token && raw.includes("/media/videos/") && !raw.includes("?token=") && !raw.includes("&token=")) {
    const separator = raw.includes("?") ? "&" : "?";
    return `${raw}${separator}token=${encodeURIComponent(token)}`;
  }
  return raw;
};

export default function LessonClient({ course, modules, initialLessonId, initialProgress, isEnrolled }: LessonClientProps) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'notes'>('overview');
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>(() => {
    const map: Record<string, ProgressEntry> = {};
    initialProgress.forEach((p: any) => {
      map[String(p.lesson)] = { is_completed: p.is_completed, current_timecode: p.current_timecode || 0 };
    });
    return map;
  });
  const [markingComplete, setMarkingComplete] = useState(false);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  const lastSavedRef = useRef(0);
  const autoCompletedRef = useRef<Set<string>>(new Set());

  const allLessons: any[] = useMemo(() => modules.flatMap((m) => m.lessons || []), [modules]);
  const activeIndex = allLessons.findIndex((l) => String(l.id) === activeLessonId);
  const activeLesson = allLessons[activeIndex] || allLessons[0];
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const canAccess = (l: any) => isEnrolled || l?.is_free_preview;

  const [courseCompleted, setCourseCompleted] = useState(() =>
    allLessons.length > 0 && allLessons.every((lesson) =>
      initialProgress.some((entry) => String(entry.lesson) === String(lesson.id) && entry.is_completed)
    )
  );
  const completedCount = allLessons.filter((l) => progress[String(l.id)]?.is_completed).length;
  const overallPct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isActiveCompleted = Boolean(progress[String(activeLesson?.id)]?.is_completed);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const owning = modules.find((m) => m.lessons?.some((l: any) => String(l.id) === initialLessonId));
    return owning ? { [String(owning.id)]: true } : modules[0] ? { [String(modules[0].id)]: true } : {};
  });

  // ---------- Backend sync ----------
  const sendProgress = useCallback(async (lessonId: string, body: Record<string, any>, keepalive = false) => {
    if (!isEnrolled) return null;
    try {
      const res = await authFetch(`${API_URL}/progress/update_progress/`, {
        method: "POST",
        body: JSON.stringify({ lesson_id: lessonId, ...body }),
        keepalive,
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      console.error("Failed to save progress", e);
      return null;
    }
  }, [isEnrolled]);

  const saveTimecode = useCallback((lessonId: string, time: number, keepalive = false) => {
    if (!lessonId || time <= 0) return;
    lastSavedRef.current = time;
    setProgress((p) => ({ ...p, [lessonId]: { is_completed: p[lessonId]?.is_completed || false, current_timecode: time } }));
    sendProgress(lessonId, { current_timecode: time }, keepalive);
  }, [sendProgress]);

  const setCompleted = useCallback(async (lessonId: string, value: boolean) => {
    setProgress((p) => ({ ...p, [lessonId]: { current_timecode: p[lessonId]?.current_timecode || 0, is_completed: value } }));
    const data = await sendProgress(lessonId, { is_completed: value });
    if (data?.course_completed) setCourseCompleted(true);
    return data;
  }, [sendProgress]);

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    setMarkingComplete(true);
    await setCompleted(String(activeLesson.id), !isActiveCompleted);
    setMarkingComplete(false);
  };

  // Persist position when leaving the page
  useEffect(() => {
    const onUnload = () => {
      const t = playerRef.current?.getCurrentTime() || 0;
      if (activeLesson && t > 0) saveTimecode(String(activeLesson.id), t, true);
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [activeLesson, saveTimecode]);

  const goToLesson = useCallback((lesson: any) => {
    if (!lesson || (!isEnrolled && !lesson?.is_free_preview)) return;
    // Save position on the lesson we're leaving
    const t = playerRef.current?.getCurrentTime() || 0;
    if (activeLesson && t > 0) saveTimecode(String(activeLesson.id), t);

    setNextCountdown(null);
    lastSavedRef.current = 0;
    setActiveLessonId(String(lesson.id));
    const owning = modules.find((m) => m.lessons?.some((l: any) => String(l.id) === String(lesson.id)));
    if (owning) setExpandedModules((e) => ({ ...e, [String(owning.id)]: true }));
    // Update URL without a server round-trip
    window.history.replaceState(null, "", `/student/courses/${course.id}/lesson/${lesson.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeLesson, saveTimecode, modules, course.id, isEnrolled]);

  // Auto-advance countdown
  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) { goToLesson(nextLesson); return; }
    const t = setTimeout(() => setNextCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [nextCountdown, nextLesson, goToLesson]);

  // ---------- Player callbacks ----------
  const handleTimeUpdate = (current: number, duration: number) => {
    if (!activeLesson) return;
    const id = String(activeLesson.id);
    if (Math.abs(current - lastSavedRef.current) >= SAVE_INTERVAL_SEC) saveTimecode(id, current);
    if (duration > 0 && current / duration >= AUTO_COMPLETE_RATIO && !progress[id]?.is_completed && !autoCompletedRef.current.has(id)) {
      autoCompletedRef.current.add(id);
      setCompleted(id, true);
    }
  };

  const handleEnded = () => {
    if (!activeLesson) return;
    const id = String(activeLesson.id);
    if (!progress[id]?.is_completed) setCompleted(id, true);
    if (nextLesson && canAccess(nextLesson)) setNextCountdown(NEXT_COUNTDOWN_SEC);
  };

  const token = getCookieValue("access_token");
  const videoSrc = getLessonVideo(activeLesson, token);
  const startAt = progress[String(activeLesson?.id)]?.current_timecode || 0;

  if (!activeLesson) {
    return (
      <div className="p-8 text-center text-gray-500">
        {isFrench ? "Cette formation n'a pas encore de leçons." : "This course has no lessons yet."}
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-full">
      {/* ================= Left column ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {courseCompleted && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20 px-4 py-3">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-300">
              <Award className="w-6 h-6" />
              <p className="text-sm font-semibold">
                {isFrench ? "Félicitations ! Vous avez terminé cette formation." : "Congratulations! You completed this course."}
              </p>
            </div>
            <Link href={`/student/courses/${course.id}/certificate`} className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline whitespace-nowrap">
              {isFrench ? "Obtenir le certificat →" : "Get certificate →"}
            </Link>
          </div>
        )}

        <div className="relative">
          <VideoPlayer
            ref={playerRef}
            key={activeLesson.id}
            src={videoSrc}
            title={activeLesson.title}
            poster={course.thumbnail}
            startAt={startAt}
            onTimeUpdate={handleTimeUpdate}
            onPause={(t) => saveTimecode(String(activeLesson.id), t)}
            onEnded={handleEnded}
            onNext={() => goToLesson(nextLesson)}
            hasNext={Boolean(nextLesson && canAccess(nextLesson))}
          />

          {/* Up-next overlay */}
          {nextCountdown !== null && nextLesson && (
            <div className="absolute inset-0 rounded-2xl bg-black/85 flex flex-col items-center justify-center text-center p-6 z-10">
              <p className="text-white/60 text-sm uppercase tracking-wider mb-2">
                {isFrench ? `Suivant dans ${nextCountdown}s` : `Up next in ${nextCountdown}s`}
              </p>
              <p className="text-white text-xl font-bold mb-6 max-w-md">{nextLesson.title}</p>
              <div className="flex gap-3">
                <button onClick={() => setNextCountdown(null)} className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-2">
                  <X className="w-4 h-4" /> {isFrench ? "Annuler" : "Cancel"}
                </button>
                <button onClick={() => goToLesson(nextLesson)} className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> {isFrench ? "Lire maintenant" : "Play now"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lesson header + actions */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {isFrench ? `Leçon ${activeIndex + 1} sur ${allLessons.length}` : `Lesson ${activeIndex + 1} of ${allLessons.length}`}
              {activeLesson.duration_minutes ? <> · {activeLesson.duration_minutes} min</> : null}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{activeLesson.title}</h2>
          </div>
          {isEnrolled && (
            <button
              id="mark-complete-btn"
              onClick={handleToggleComplete}
              disabled={markingComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${
                isActiveCompleted
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                  : 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 hover:bg-brand-100'
              }`}
            >
              {markingComplete ? <Loader2 className="w-5 h-5 animate-spin" /> : isActiveCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              {isActiveCompleted ? (isFrench ? "Terminé" : "Completed") : (isFrench ? "Marquer comme terminé" : "Mark as complete")}
            </button>
          )}
        </div>

        {/* Prev / Next */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => goToLesson(prevLesson)}
            disabled={!prevLesson || !canAccess(prevLesson)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> {isFrench ? "Précédent" : "Previous"}
          </button>
          <button
            onClick={() => goToLesson(nextLesson)}
            disabled={!nextLesson || !canAccess(nextLesson)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-sm font-semibold text-white dark:text-gray-900 hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isFrench ? "Leçon suivante" : "Next lesson"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 mt-6 mb-6">
          {[
            { id: 'overview', label: isFrench ? 'Aperçu' : 'Overview', icon: BookOpen },
            { id: 'qa', label: isFrench ? 'Questions / Réponses' : 'Q&A', icon: MessageSquare },
            { id: 'notes', label: isFrench ? 'Notes' : 'Notes', icon: StickyNote },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3.5 px-5 font-medium text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full" />}
            </button>
          ))}
        </div>

        <div className="pb-10">
          {activeTab === 'overview' && <OverviewTab lesson={activeLesson} course={course} isFrench={isFrench} />}
          {activeTab === 'qa' && <QATab lessonId={String(activeLesson.id)} canPost={isEnrolled} isFrench={isFrench} />}
          {activeTab === 'notes' && (
            <NotesTab
              courseId={String(course.id)}
              lessonId={String(activeLesson.id)}
              getTime={() => playerRef.current?.getCurrentTime() || 0}
              seekTo={(t) => playerRef.current?.seekTo(t)}
              isFrench={isFrench}
            />
          )}
        </div>
      </div>

      {/* ================= Sidebar ================= */}
      <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden sticky top-6">
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {isFrench ? "Contenu du cours" : "Course Content"}
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
              {isFrench
                ? `${modules.length} modules · ${allLessons.length} leçons`
                : `${modules.length} sections · ${allLessons.length} lessons`}
            </p>
            {isEnrolled && (
              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-gray-600 dark:text-gray-300">
                    {completedCount}/{allLessons.length} {isFrench ? "terminées" : "completed"}
                  </span>
                  <span className="text-brand-600 dark:text-brand-400">{overallPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-[60vh] xl:max-h-[calc(100vh-14rem)]">
            {modules.map((module: any, idx: number) => {
              const key = String(module.id);
              const lessons = module.lessons || [];
              const doneInModule = lessons.filter((l: any) => progress[String(l.id)]?.is_completed).length;
              const minutes = lessons.reduce((a: number, l: any) => a + (l.duration_minutes || 0), 0);
              const open = expandedModules[key];
              return (
                <div key={key} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <button
                    onClick={() => setExpandedModules((e) => ({ ...e, [key]: !e[key] }))}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                        {isFrench ? `Module ${idx + 1} : ${module.title}` : `Section ${idx + 1}: ${module.title}`}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {doneInModule} / {lessons.length} · {minutes} min
                      </p>
                    </div>
                    {open ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                  </button>

                  {open && (
                    <div className="bg-gray-50 dark:bg-gray-900/30 flex flex-col py-1">
                      {lessons.map((lesson: any, lessonIdx: number) => {
                        const id = String(lesson.id);
                        const isActive = id === String(activeLesson.id);
                        const done = progress[id]?.is_completed;
                        const locked = !canAccess(lesson);
                        const saved = progress[id]?.current_timecode || 0;
                        return (
                          <button
                            key={id}
                            onClick={() => goToLesson(lesson)}
                            disabled={locked}
                            className={`flex items-start gap-3 p-3 pl-4 sm:pl-6 text-left transition-colors border-l-2 ${
                              isActive ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                            } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="mt-0.5">
                              {locked ? <Lock className="w-4 h-4 text-gray-400" />
                                : done ? <CheckCircle className="w-4 h-4 text-green-500" />
                                : <Circle className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-gray-400'}`} />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm leading-tight ${isActive ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {lessonIdx + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                {getLessonVideo(lesson, token) ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                <span>{lesson.duration_minutes || 0} min</span>
                                {!done && saved > 5 && (
                                  <span className="text-brand-600 dark:text-brand-400">
                                    · {isFrench ? "à" : "at"} {formatTime(saved)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== Overview ====================== */
function OverviewTab({ lesson, course, isFrench }: { lesson: any; course: any; isFrench: boolean }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {isFrench ? "À propos de cette leçon" : "About this lesson"}
        </h3>
        {lesson.content ? (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{lesson.content}</div>
        ) : (
          <p className="text-sm text-gray-500">
            {isFrench ? "Aucun contenu écrit pour cette leçon." : "No written content for this lesson."}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {isFrench ? "À propos de cette formation" : "About this course"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm line-clamp-6">
          {course.description || (isFrench ? "Aucune description disponible." : "No description available.")}
        </p>
        {course.instructor && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            {course.instructor.avatar ? (
              <img src={course.instructor.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold">
                {(course.instructor.first_name || "I").charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {course.instructor.first_name} {course.instructor.last_name}
              </p>
              {course.instructor.title && <p className="text-xs text-gray-500">{course.instructor.title}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================== Q&A (connected to /api/questions) ====================== */
function QATab({ lessonId, canPost, isFrench }: { lessonId: string; canPost: boolean; isFrench: boolean }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authFetch(`${API_URL}/questions/?lesson_id=${lessonId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (!cancelled) setQuestions(Array.isArray(data) ? data : data.results || []); })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [lessonId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/questions/`, {
        method: "POST",
        body: JSON.stringify({ lesson: lessonId, title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error(isFrench ? "Impossible d'envoyer votre question." : "Could not post your question.");
      const q = await res.json();
      setQuestions((qs) => [{ ...q, answers: q.answers || [] }, ...qs]);
      setTitle("");
      setBody("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <form onSubmit={submit} className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <input
            id="qa-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isFrench ? "Titre de votre question" : "Question title"}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
          <textarea
            id="qa-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={isFrench ? "Décrivez votre question en détail…" : "Describe your question in detail…"}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting || !title.trim() || !body.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isFrench ? "Poser la question" : "Ask question"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">
            {isFrench ? "Aucune question pour cette leçon. Soyez le premier à poser une question !" : "No questions for this lesson yet. Be the first to ask!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{q.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{q.student_name} · {new Date(q.created_at).toLocaleDateString()}</p>
                </div>
                {q.is_resolved && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {isFrench ? "Résolu" : "Resolved"}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-wrap">{q.body}</p>
              {q.answers?.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                  {q.answers.map((a: any) => (
                    <div key={a.id}>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {a.author_name}
                        {a.author_role === "INSTRUCTOR" && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                            {isFrench ? "Formateur" : "Instructor"}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ====================== Notes (timecoded, stored locally) ====================== */
interface Note { id: string; lessonId: string; time: number; text: string; createdAt: number }

function NotesTab({ courseId, lessonId, getTime, seekTo, isFrench }: {
  courseId: string; lessonId: string; getTime: () => number; seekTo: (t: number) => void; isFrench: boolean;
}) {
  const storageKey = `lesson_notes_${courseId}`;
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [capturedTime, setCapturedTime] = useState<number | null>(null);

  useEffect(() => {
    try { setNotes(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setNotes([]); }
  }, [storageKey]);

  const persist = (next: Note[]) => {
    setNotes(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      lessonId,
      time: capturedTime ?? getTime(),
      text: text.trim(),
      createdAt: Date.now(),
    };
    persist([...notes, note]);
    setText("");
    setCapturedTime(null);
  };

  const lessonNotes = notes.filter((n) => n.lessonId === lessonId).sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-5">
      <form onSubmit={addNote} className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 text-brand-500" />
          {isFrench ? "Note à" : "Note at"} <span className="font-semibold tabular-nums">{formatTime(capturedTime ?? getTime())}</span>
        </div>
        <textarea
          id="note-text"
          value={text}
          onFocus={() => capturedTime === null && setCapturedTime(getTime())}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={isFrench ? "Écrivez une note pour ce moment de la vidéo…" : "Write a note for this moment in the video…"}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button type="submit" disabled={!text.trim()} className="px-5 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold disabled:opacity-50">
            {isFrench ? "Enregistrer la note" : "Save note"}
          </button>
        </div>
      </form>

      {lessonNotes.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-8">
          {isFrench ? "Aucune note pour cette leçon pour l'instant." : "No notes for this lesson yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {lessonNotes.map((n) => (
            <li key={n.id} className="group flex items-start gap-3 bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => seekTo(n.time)}
                className="px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold tabular-nums hover:bg-brand-100"
                title={isFrench ? "Sauter à ce moment" : "Jump to this moment"}
              >
                {formatTime(n.time)}
              </button>
              <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{n.text}</p>
              <button
                onClick={() => persist(notes.filter((x) => x.id !== n.id))}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                aria-label={isFrench ? "Supprimer la note" : "Delete note"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
