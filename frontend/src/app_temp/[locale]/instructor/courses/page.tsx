import React from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cours | Yinga Academia",
  description: "Sélectionnez un cours",
};

export default function InstructorCourseSelect() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <BookOpen className="h-12 w-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Pas de cours choisi pour l'instant
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Veuillez sélectionner un cours depuis votre liste pour l'éditer, ou créez-en un nouveau.
        </p>
      </div>
      <div className="flex gap-4">
        <Link 
          href="/instructor/my-courses" 
          className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
        >
          Mes Cours
        </Link>
        <Link 
          href="/instructor/create-course" 
          className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Créer un Cours
        </Link>
      </div>
    </div>
  );
}
