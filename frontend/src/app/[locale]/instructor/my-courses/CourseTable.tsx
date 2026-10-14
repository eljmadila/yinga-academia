"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Edit3,
  Trash2,
  Users,
  Star,
  Search,
  BarChart,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { resolveApiUrl } from "@/lib/api";

interface Course {
  id: string | number;
  title: string;
  thumbnail?: string | null;
  is_published: boolean;
  average_rating?: number | string | null;
  enrollments_count?: number | null;
  price: number | string;
  category?: { name: string } | null;
}

interface CourseTableProps {
  initialCourses: Course[];
  token: string | undefined;
}

type Tab = "all" | "published" | "drafts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&q=80";

export default function CourseTable({ initialCourses, token }: CourseTableProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "delete" | "publish" | null;
    courseId: string | number | null;
    title: string;
    message: string;
  }>({ isOpen: false, type: null, courseId: null, title: "", message: "" });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keep local state in sync when the server component passes fresh data
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const confirmAction = (type: "delete" | "publish", courseId: string | number) => {
    if (type === "delete") {
      setDialog({
        isOpen: true,
        type,
        courseId,
        title: "Delete Course",
        message: "Are you sure you want to delete this course? This action cannot be undone.",
      });
    } else {
      setDialog({
        isOpen: true,
        type,
        courseId,
        title: "Publish Course",
        message: "Are you sure you want to publish this course? It will become visible to students.",
      });
    }
  };

  const handleConfirmDialog = async () => {
    if (!dialog.courseId || !dialog.type) return;
    const { type, courseId } = dialog;
    setDialog({ ...dialog, isOpen: false });

    if (type === "delete") {
      await executeDelete(courseId);
    } else {
      await executePublish(courseId);
    }
  };

  const executeDelete = async (courseId: string | number) => {
    const idStr = String(courseId);
    setIsDeleting(idStr);
    try {
      const res = await fetch(resolveApiUrl(`/courses/${idStr}/`), {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => String(c.id) !== idStr));
        showToast("Course deleted successfully", "success");
      } else {
        showToast("Failed to delete course.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while deleting the course.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const executePublish = async (courseId: string | number) => {
    const idStr = String(courseId);
    setIsPublishing(idStr);
    try {
      const res = await fetch(resolveApiUrl(`/courses/${idStr}/`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_published: true, status: "PUBLISHED" }),
      });
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (String(c.id) === idStr ? { ...c, is_published: true, status: "PUBLISHED" } : c))
        );
        showToast("Course published successfully!", "success");
      } else {
        showToast("Failed to publish course.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while publishing the course.", "error");
    } finally {
      setIsPublishing(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "published") return c.is_published;
    if (activeTab === "drafts") return !c.is_published;
    return true;
  });

  const publishedCount = courses.filter((c) => c.is_published).length;
  const draftCount = courses.length - publishedCount;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All Courses", count: courses.length },
    { key: "published", label: "Published", count: publishedCount },
    { key: "drafts", label: "Drafts", count: draftCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Students</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 relative">
                          <img
                            src={course.thumbnail || FALLBACK_THUMBNAIL}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {course.average_rating || "0.0"}
                            </span>
                            <span>•</span>
                            <span>{course.category?.name || "General"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {course.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          <XCircle className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">
                          {course.enrollments_count || 0}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Number(course.price) > 0 ? `$${course.price}` : "Free"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Analytics */}
                        <Link
                          href={`/instructor/dashboard?course=${course.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <BarChart className="w-4 h-4" />
                        </Link>

                        {/* Publish (Only for drafts) */}
                        {!course.is_published && (
                          <button
                            onClick={() => confirmAction("publish", course.id)}
                            disabled={isPublishing === String(course.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isPublishing === String(course.id)
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                            }`}
                            title="Publish Course"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <Link
                          href={`/instructor/create-course?edit=${course.id}`}
                          className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => confirmAction("delete", course.id)}
                          disabled={isDeleting === String(course.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDeleting === String(course.id)
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                          }`}
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      No courses found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      {search
                        ? "Try adjusting your search terms."
                        : "You haven't created any courses yet."}
                    </p>
                    {!search && (
                      <Link
                        href="/instructor/create-course"
                        className="inline-flex px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors text-sm"
                      >
                        Create your first course
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {dialog.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              {dialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDialog({ ...dialog, isOpen: false })}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDialog}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${
                  dialog.type === "delete"
                    ? "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500/50"
                    : "bg-brand-500 hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/50"
                }`}
              >
                {dialog.type === "delete" ? "Delete" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}