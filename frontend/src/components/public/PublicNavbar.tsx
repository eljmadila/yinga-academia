"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function PublicNavbar() {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo/logo-yinga-full.png"
            alt="Yinga Academia"
            className="h-9 sm:h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          <nav className="hidden md:flex items-center gap-6 text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-brand-500 transition-colors">
              {locale === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link href="/catalog" className="hover:text-brand-500 transition-colors">
              {locale === "fr" ? "Catalogue" : "Catalog"}
            </Link>
            <Link href="/contact" className="hover:text-brand-500 transition-colors">
              {t("contact")}
            </Link>
          </nav>

          <LanguageSwitcher variant="pill" />

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:text-brand-500 transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-600 hover:shadow-brand-500/25 transition-all"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
