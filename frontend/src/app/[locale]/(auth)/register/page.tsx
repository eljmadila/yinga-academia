import SignUpForm from "@/components/auth/SignUpForm";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export const metadata: Metadata = {
  title: "Register | Yinga Academia",
  description: "Créez votre compte",
};

export default async function Register({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";
  const t = await getTranslations("auth");

  return (
    <div className="relative flex min-h-screen bg-brand-50 dark:bg-gray-950">
      {/* Top Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="pill" />
      </div>

      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-brand-100 lg:flex dark:bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"
          alt="People collaborating"
          fill
          className="object-cover opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/70 to-brand-700/60" />

        <div className="relative z-10 max-w-xl px-12 text-white">
          <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-sm">
            {isFrench ? "Commencez votre voyage" : "Start your path"}
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white">{t("registerHeroTitle")}</h2>
          <p className="mb-8 text-lg text-white/85">{t("registerHeroDescription")}</p>

          <div className="grid gap-3 text-sm text-white/90 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-lg font-semibold">
                {isFrench ? "Apprenez en toute confiance" : "Learn with confidence"}
              </div>
              <p className="text-white/75">
                {isFrench
                  ? "Accédez à des cours structurés, un suivi guidé et du mentorat."
                  : "Access structured courses, guided progress, and mentorship opportunities."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="mb-2 text-lg font-semibold">
                {isFrench ? "Enseignez et évoluez" : "Teach and grow"}
              </div>
              <p className="text-white/75">
                {isFrench
                  ? "Créez votre profil de formateur et commencez à publier vos formations."
                  : "Create a profile that unlocks your instructor dashboard and content workflow."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/logo/logo-yinga-full.png"
              alt="Yinga Academia Logo"
              width={220}
              height={60}
              className="h-30 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(10,18,45,0.12)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/70 sm:p-10">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
