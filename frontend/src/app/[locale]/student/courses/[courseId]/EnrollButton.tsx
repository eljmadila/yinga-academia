"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function EnrollButton({ courseId, price }: { courseId: string; price: number }) {
  const router = useRouter();
  const tCourse = useTranslations("student.course");
  const tSupport = useTranslations("support");
  const [loading, setLoading] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const handleEnroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = getCookieValue("access_token");
      const isPaid = price > 0;
      const endpoint = isPaid
        ? `${API_URL}/payments/mpesa/stk-push/`
        : `${API_URL}/enrollments/checkout/`;
      const normalizedPhone = phoneNumber.replace(/\D/g, "").replace(/^0/, "254");
      if (isPaid && !idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          course_id: courseId,
          ...(isPaid ? { phone_number: normalizedPhone } : {}),
          ...(isPaid ? { idempotency_key: idempotencyKey.current } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed");
      }
      if (isPaid) {
        setPaymentPending(true);
        router.push(`/student/checkout/success?order_id=${encodeURIComponent(data.order_id)}`);
      } else router.refresh();
    } catch (e: any) {
      idempotencyKey.current = null;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleEnroll} className="flex w-full flex-col gap-3 sm:w-auto">
      {price > 0 && (
        <label htmlFor="mpesa-phone" className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span>{tSupport("phoneTitle")} (M-Pesa)</span>
          <input
            id="mpesa-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="2547XXXXXXXX"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
            disabled={loading || paymentPending}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white sm:w-64"
          />
        </label>
      )}
      <button
        id="enroll-course-btn"
        type="submit"
        disabled={loading || paymentPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {loading || paymentPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
        {loading || paymentPending
          ? tCourse("processing")
          : price > 0
            ? `${tCourse("enrollNow")} · KES ${price.toFixed(2)}`
            : tCourse("freeEnroll")}
      </button>
      {paymentPending && <p role="status" className="text-sm text-gray-600 dark:text-gray-400">{tCourse("processing")}</p>}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
