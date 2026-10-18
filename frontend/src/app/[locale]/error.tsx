"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isFrench = locale === "fr";

  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {isFrench ? "Une erreur temporaire est survenue" : "Something went wrong"}
      </h1>

      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {isFrench
          ? "La page n'a pas pu être chargée correctement. Veuillez recharger ou retourner au catalogue."
          : "The page could not be loaded properly. Please try reloading or head back to the course catalog."}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          {isFrench ? "Réessayer" : "Try Again"}
        </button>

        <Link
          href="/student/catalog"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-all"
        >
          <Home className="w-4 h-4" />
          {isFrench ? "Retour au catalogue" : "Back to Catalog"}
        </Link>
      </div>
    </div>
  );
}
