"use client";

import React, { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { FrFlagIcon, UsFlagIcon } from "@/icons";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "pill" | "dropdown" | "icon";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "pill",
  className = "",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    // 1. Explicitly set NEXT_LOCALE cookie with long expiration and root path
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // 2. Route replace using next-intl router
    router.replace(pathname, { locale: newLocale });
    
    // 3. Refresh router state so RSC updates immediately
    router.refresh();
    setIsOpen(false);
  };

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center rounded-full border border-gray-200/90 bg-gray-100/80 p-0.5 text-xs font-semibold backdrop-blur-sm dark:border-gray-800 dark:bg-gray-800/80 ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => changeLanguage("en")}
          aria-label="Switch to English"
          aria-pressed={locale === "en"}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-200 ${
            locale === "en"
              ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-400 font-bold"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <UsFlagIcon className="h-3.5 w-3.5 rounded-full object-cover shrink-0" />
          <span>EN</span>
        </button>

        <button
          type="button"
          onClick={() => changeLanguage("fr")}
          aria-label="Passer en Français"
          aria-pressed={locale === "fr"}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-200 ${
            locale === "fr"
              ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-brand-400 font-bold"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <FrFlagIcon className="h-3.5 w-3.5 rounded-full object-cover shrink-0" />
          <span>FR</span>
        </button>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => changeLanguage(locale === "fr" ? "en" : "fr")}
        aria-label={locale === "fr" ? "Switch to English" : "Passer en Français"}
        title={locale === "fr" ? "Switch to English" : "Passer en Français"}
        className={`inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:border-brand-300 hover:text-brand-600 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-400 ${className}`}
      >
        {locale === "fr" ? (
          <>
            <FrFlagIcon className="h-4 w-4 rounded-full object-cover" />
            <span>FR</span>
          </>
        ) : (
          <>
            <UsFlagIcon className="h-4 w-4 rounded-full object-cover" />
            <span>EN</span>
          </>
        )}
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        <span className="uppercase">{locale}</span>
        {locale === "fr" ? (
          <FrFlagIcon className="h-3.5 w-3.5 rounded-full" />
        ) : (
          <UsFlagIcon className="h-3.5 w-3.5 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-36 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => changeLanguage("en")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              locale === "en"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 font-semibold"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <UsFlagIcon className="h-4 w-4 rounded-full" />
            <span>English</span>
          </button>
          <button
            type="button"
            onClick={() => changeLanguage("fr")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              locale === "fr"
                ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 font-semibold"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <FrFlagIcon className="h-4 w-4 rounded-full" />
            <span>Français</span>
          </button>
        </div>
      )}
    </div>
  );
}
