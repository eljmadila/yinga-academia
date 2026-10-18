"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, ShoppingCart, ShieldCheck } from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api")
).trim().replace(/\/+$/, "");

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function EnrollButton({ courseId, price }: { courseId: string; price: number }) {
  const router = useRouter();
  const tCourse = useTranslations("student.course");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getCookieValue("access_token");
      if (!token) {
        if (typeof window !== "undefined") {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
        return;
      }

      const isPaid = price > 0;
      const endpoint = isPaid
        ? `${API_URL}/payments/paystack/initialize/`
        : `${API_URL}/enrollments/checkout/`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed");
      }

      if (isPaid && data.authorization_url) {
        // Redirect to Paystack's hosted secure checkout
        window.location.href = data.authorization_url;
      } else {
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEnroll} className="flex w-full flex-col gap-2.5 sm:w-auto">
      <button
        id="enroll-course-btn"
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
        {loading
          ? tCourse("processing")
          : price > 0
            ? `${tCourse("enrollNow")} · KES ${price.toFixed(2)}`
            : tCourse("freeEnroll")}
      </button>

      {price > 0 && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Paystack · M-Pesa & Cards</span>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
