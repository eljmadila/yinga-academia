"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function PublicFooter() {
  const t = useTranslations("home");

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-12 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo/logo-yinga-full.png"
                alt="Yinga Academia"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Yinga Academia est une plateforme d&apos;apprentissage moderne qui connecte étudiants et experts à travers des formations certifiantes et interactives.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/catalog" className="hover:text-brand-500 transition-colors">
                  Catalogue des cours
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-brand-500 transition-colors">
                  Espace Étudiant
                </Link>
              </li>
              <li>
                <Link href="/instructor/dashboard" className="hover:text-brand-500 transition-colors">
                  Espace Formateur
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-500 transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Légal & Sécurité
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="hover:text-brand-500 transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-500 transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-500 transition-colors">
                  Assistance & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 dark:border-gray-800 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Yinga Academia. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
