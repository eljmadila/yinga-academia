"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://yinga-backend.onrender.com/api"
          : "http://localhost:8000/api");
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // We pass the email as username since Django's default AbstractUser expects 'username'
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      const safeName = email.split("@")[0] || "Student";
      document.cookie = `access_token=${data.access}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_name=${encodeURIComponent(safeName)}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_email=${encodeURIComponent(email)}; path=/; max-age=86400; SameSite=Lax`;
      const userRole = data.role ? data.role.toLowerCase() : "student";
      document.cookie = `user_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      window.location.href = userRole === "instructor" ? "/instructor/dashboard" : "/student/dashboard";
    } catch (err) {
      setError(
        locale === "fr"
          ? "Échec de la connexion. Veuillez vérifier votre email et mot de passe."
          : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col dark:text-white">
      <div className="mb-8 text-start">
        <div className="mb-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          Yinga Academia
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("welcomeBack")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("loginDescription")}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}



      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
            />
            <label htmlFor="remember" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("rememberMe")}
            </label>
          </div>
          <Link
            href="/reset-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700" disabled={isLoading}>
          {isLoading ? t("signingIn") : t("signIn")}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t("noAccount")} {" "}
        <Link
          href="/register"
          className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
        >
          {t("signUp")}
        </Link>
      </div>
    </div>
  );
}
