'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function NotFound() {
  const locale = useLocale();
  const isFrench = locale === 'fr';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
        {isFrench ? "Page non trouvée" : "Page Not Found"}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        {isFrench
          ? "La page que vous recherchez n'existe pas ou a été déplacée."
          : "The page you are looking for doesn't exist or has been moved."}
      </p>
      <Link 
        href={`/${locale}`}
        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
      >
        {isFrench ? "Retour à l'accueil" : "Return Home"}
      </Link>
    </div>
  );
}