import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { cookies } from "next/headers";
import CourseTable from './CourseTable';

export default async function InstructorMyCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  let courses = [];
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${API_BASE}/courses/my/`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      next: { revalidate: 0 }
    });
    if (res.ok) {
      courses = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch instructor courses", err);
  }

  const publishedCount = courses.filter((c: any) => c.is_published).length;
  const draftCount = courses.length - publishedCount;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isFrench ? "Mes Cours" : "My Courses"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isFrench ? "Gérez et créez vos formations" : "Manage and create your courses"}
            </p>
          </div>
        </div>
        <Link 
          href={`/${locale}/instructor/create-course`} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {isFrench ? "Créer un nouveau cours" : "Create New Course"}
        </Link>
      </div>

      {/* Main Course Table */}
      <CourseTable initialCourses={courses} token={token} />
      
    </div>
  );
}