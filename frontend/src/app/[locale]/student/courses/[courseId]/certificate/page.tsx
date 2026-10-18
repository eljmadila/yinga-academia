import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Award, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import CertificateDownloadButton from '@/components/student/CertificateDownloadButton';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api")
).trim().replace(/\/+$/, "");

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { courseId, locale } = await params;
  const isFrench = locale === "fr";
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  let course = null;
  let enrollment = null;

  try {
    const [courseRes, enrollmentsRes] = await Promise.all([
      fetch(`${API_URL}/courses/${courseId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      }),
      token
        ? fetch(`${API_URL}/enrollments/`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          })
        : null,
    ]);

    if (courseRes.ok) course = await courseRes.json();
    if (enrollmentsRes?.ok) {
      const enrollments = await enrollmentsRes.json();
      enrollment = Array.isArray(enrollments)
        ? enrollments.find(
            (e: any) =>
              String(e.course) === String(courseId) ||
              String(e.course_details?.id) === String(courseId)
          )
        : null;
    }
  } catch (err) {
    console.error("Failed to load certificate data", err);
  }

  if (!course) return notFound();

  const isCompleted = enrollment?.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isFrench ? "Retour à la formation" : "Back to Course Overview"}
      </Link>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
        <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>

        <span className="px-3.5 py-1 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider">
          {isFrench ? "Certificat de réussite" : "Certificate of Completion"}
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-4 mb-2">
          {course.title}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
          {isCompleted
            ? (isFrench
                ? "Félicitations ! Vous avez terminé toutes les leçons et exigences de cette formation."
                : "Congratulations! You have completed all lessons and requirements for this course.")
            : (isFrench
                ? "Terminez toutes les leçons pour obtenir et débloquer votre certificat officiel."
                : "Complete all lessons and quizzes in this course to earn and unlock your official certificate.")}
        </p>

        {isCompleted ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CertificateDownloadButton
              courseId={courseId}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            />
            <Link
              href={`/student/courses/${courseId}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              {isFrench ? "Revoir le cours" : "Review Course"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isFrench
                  ? `Progression actuelle : ${enrollment?.progress_percentage || 0}%`
                  : `Current Progress: ${enrollment?.progress_percentage || 0}%`}
              </span>
            </div>
            <div>
              <Link
                href={`/student/courses/${courseId}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md"
              >
                {isFrench ? "Continuer la formation" : "Continue Learning"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
