"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type CheckoutOrder = {
  course_id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  payment_status: string | null;
};

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function CheckoutStatus({
  orderId,
  reference,
}: {
  orderId: string | null;
  reference?: string | null;
}) {
  const t = useTranslations("student.checkout");
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(!orderId);

  // Trigger Paystack verification immediately if reference was returned in callback
  useEffect(() => {
    if (!reference) return;
    const verifyPaystack = async () => {
      try {
        const token = getCookieValue("access_token");
        await fetch(`${API_URL}/payments/paystack/verify/${encodeURIComponent(reference)}/`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch {
        // Fallback to order polling
      }
    };
    void verifyPaystack();
  }, [reference]);

  useEffect(() => {
    if (!orderId) return;

    let active = true;
    let intervalId = 0;
    const checkStatus = async () => {
      try {
        const token = getCookieValue("access_token");
        const response = await fetch(`${API_URL}/payments/orders/${orderId}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });

        if (!active) return;
        if (response.status === 404) {
          setNotFound(true);
          window.clearInterval(intervalId);
          return;
        }
        if (!response.ok) {
          setError(t("statusUnavailable"));
          return;
        }

        const data: CheckoutOrder = await response.json();
        if (!active) return;
        setOrder(data);
        setError(null);
        if (data.status === "COMPLETED" || data.status === "FAILED") window.clearInterval(intervalId);
      } catch {
        if (active) setError(t("statusUnavailable"));
      }
    };

    const pollingInterval = window.setInterval(() => void checkStatus(), 5000);
    intervalId = pollingInterval;
    void checkStatus();
    return () => {
      active = false;
      window.clearInterval(pollingInterval);
    };
  }, [orderId, t]);

  const isComplete = order?.status === "COMPLETED";
  const isFailed = order?.status === "FAILED";
  const title = notFound
    ? t("invalidOrder")
    : isComplete
      ? t("successTitle")
      : isFailed
        ? t("failureTitle")
        : t("pendingTitle");
  const description = notFound
    ? t("invalidOrder")
    : error || (isComplete
      ? t("successBody")
      : isFailed
        ? t("failureBody")
        : t("pendingBody"));

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col justify-center gap-5 px-6 py-12">
      <div aria-live="polite" role="status">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      {isComplete && order && (
        <Link
          href={`/student/courses/${order.course_id}`}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("openCourse")}
        </Link>
      )}
      {(isFailed || notFound) && (
        <Link href="/student/catalog" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
          {t("browseCourses")}
        </Link>
      )}
    </main>
  );
}