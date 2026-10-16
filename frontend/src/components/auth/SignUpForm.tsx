"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff, User, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("student");
  const t = useTranslations("auth");
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Register the user
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://yinga-backend.onrender.com/api"
          : "http://localhost:8000/api");
      const registerRes = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role: role.toUpperCase(),
        }),
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        throw new Error(
          errorData.detail ||
            errorData.username?.[0] ||
            (locale === "fr"
              ? "L'inscription a échoué. Cet email est peut-être déjà utilisé."
              : "Registration failed. Email might already be in use.")
        );
      }

      // 2. Automatically log them in after registration
      const loginRes = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!loginRes.ok) throw new Error(locale === "fr" ? "Échec de la connexion automatique." : "Login after registration failed.");

      const data = await loginRes.json();
      const safeName = `${firstName || "User"}`.trim() || "User";
      document.cookie = `access_token=${data.access}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_name=${encodeURIComponent(safeName)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;

      window.location.href = role === "instructor" ? "/instructor/dashboard" : "/student/dashboard";
    } catch (err: any) {
      setError(err.message || (locale === "fr" ? "Une erreur inattendue est survenue." : "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col dark:text-white">
      <div className="mb-8 text-start">
        <div className="mb-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          {locale === "fr" ? "Rejoignez Yinga Academia" : "Join Yinga Academia"}
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("createAccount")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("registerDescription")}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
            {t("registerAs")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                role === "student"
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <User className="h-5 w-5" />
              <span>{t("student")}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("instructor")}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                role === "instructor"
                  ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span>{t("instructor")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              {t("firstName")}
            </label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
              className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm transition-colors focus:border-brand-400 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
              {t("lastName")}
            </label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
              className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm transition-colors focus:border-brand-400 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
            {t("email")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            className="h-11 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm transition-colors focus:border-brand-400 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
            {t("password")}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11 rounded-xl border-gray-200 bg-white pe-10 text-gray-900 shadow-sm transition-colors focus:border-brand-400 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
          />
          <label htmlFor="terms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("terms")}
          </label>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700" disabled={isLoading}>
          {isLoading ? t("creatingAccount") : t("createAccount")}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t("alreadyAccount")} {" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          {t("login")}
        </Link>
      </div>
    </div>
  );
}
