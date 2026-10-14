import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Course Analytics | Yinga Academia",
  description: "Track enrollments, revenue, and course performance for your instructor dashboard.",
};

export default async function SalesAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  return <AnalyticsClient token={token} />;
}
