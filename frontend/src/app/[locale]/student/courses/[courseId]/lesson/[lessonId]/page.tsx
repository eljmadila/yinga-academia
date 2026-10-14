import React from 'react';
import LessonClient from './LessonClient';
import { notFound, redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getJson(url: string, token?: string) {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error(`Failed to fetch ${url}`, err);
    return null;
  }
}

export default async function LessonPage({ 
  params 
}: { 
  params: Promise<{ locale: string; courseId: string; lessonId: string }> 
}) {
  const { courseId, lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const [course, progress] = await Promise.all([
    getJson(`${API_URL}/courses/${courseId}/`, token),
    token ? getJson(`${API_URL}/progress/by_course/?course_id=${courseId}&include_incomplete=1`, token) : null,
  ]);

  if (!course) return notFound();

  // Ordered list of all lessons (modules first, then lessons without a module)
  const modules: any[] = [...(course.modules || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const orphanLessons = (course.lessons || []).filter((l: any) => !l.module);
  if (orphanLessons.length > 0) {
    modules.push({ id: "orphan", title: "Additional lessons", lessons: orphanLessons });
  }
  modules.forEach((m) => {
    m.lessons = [...(m.lessons || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  });
  const allLessons = modules.flatMap((m) => m.lessons);

  const lesson = allLessons.find((l: any) => String(l.id) === String(lessonId));
  if (!lesson) {
    if (allLessons[0]) redirect(`/student/courses/${courseId}/lesson/${allLessons[0].id}`);
    return notFound();
  }

  // Only enrolled students can watch, except free-preview lessons
  if (!course.is_enrolled && !lesson.is_free_preview) {
    redirect(`/student/courses/${courseId}`);
  }

  return (
    <div className="flex flex-col h-full -m-4 md:-m-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 min-w-0">
          <Link 
            href={`/student/courses/${courseId}`}
            aria-label="Back to course"
            className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400">Course Player</p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
              {course.title}
            </h1>
          </div>
        </div>
      </div>
      
      <LessonClient
        course={course}
        modules={modules}
        initialLessonId={String(lesson.id)}
        initialProgress={Array.isArray(progress) ? progress : []}
        isEnrolled={Boolean(course.is_enrolled)}
      />
    </div>
  );
}
