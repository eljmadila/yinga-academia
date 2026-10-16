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

export default function ResetPasswordConfirmForm({ uid, token }: { uid: string; token: string }) {
  const t = useTranslations("passwordReset");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password1: password, new_password2: confirmPassword }),
      });
      if (!response.ok) throw new Error("Password reset confirmation failed");
      setComplete(true);
    } catch (resetError) {
      console.error(resetError);
      setError(t("invalidLink"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("confirmTitle")}</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t("confirmDescription")}</p>

      {complete ? (
        <div className="mt-6 space-y-5">
          <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            {t("resetComplete")}
          </p>
          <Link href="/login" className="inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            {t("backToLogin")}
          </Link>
        </div>
      ) : !uid || !token ? (
        <div className="mt-6 space-y-5">
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {t("invalidLink")}
          </p>
          <Link href="/reset-password" className="inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            {t("requestAnother")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("newPassword")}</label>
            <Input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("confirmPassword")}</label>
            <Input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("resetting") : t("resetPassword")}
          </Button>
        </form>
      )}
    </section>
  );
}
