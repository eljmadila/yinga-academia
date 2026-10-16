"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api");

export default function ResetPasswordRequestForm() {
  const t = useTranslations("passwordReset");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Password reset request failed");
      setSent(true);
    } catch (requestError) {
      console.error(requestError);
      setError(t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("requestTitle")}</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("requestDescription")}</p>

      {sent ? (
        <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {t("emailSent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("email")}</label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("sending") : t("sendInstructions")}
          </Button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
        {t("backToLogin")}
      </Link>
    </section>
  );
}
