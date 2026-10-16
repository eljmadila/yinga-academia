"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Wallet, TrendingUp, CreditCard, ArrowRight, Download, Filter, CheckCircle, XCircle } from "lucide-react";
import { SalesPerformanceChart, RevenueDistributionChart } from "@/components/instructor/AnalyticsCharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { useLocale } from "next-intl";
import { resolveApiUrl } from "@/lib/api";

interface AnalyticsData {
  totalStudents: number;
  activeCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  coursePerformance: Array<{
    course: string;
    revenue: number;
    learners: number;
    completionRate: number;
    fill: string;
  }>;
  recentTransactions: Array<{
    id: string;
    student: string;
    course: string;
    date: string;
    amount: number;
    status: string;
    method: string;
  }>;
  monthlyHistory: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AnalyticsClient({ token }: { token: string | undefined }) {
  const locale = useLocale();
  const isFrench = locale === "fr";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "7" | "30">("all");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) return;
    
    fetch(resolveApiUrl('/analytics/instructor/'), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      setData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleExportPDF = () => {
    if (!data?.recentTransactions || data.recentTransactions.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Recent Transactions", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      const headers = [["Transaction ID", "Student", "Course", "Amount", "Method", "Date", "Status"]];
      const pdfData = data.recentTransactions.map(t => [
        t.id,
        t.student,
        t.course,
        `€${t.amount.toFixed(2)}`,
        t.method,
        t.date,
        t.status
      ]);

      autoTable(doc, {
        startY: 36,
        head: headers,
        body: pdfData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRequestPayout = () => {
    setIsRequestingPayout(true);
    // Simulate API delay
    setTimeout(() => {
      setIsRequestingPayout(false);
      showToast(isFrench ? "Demande de virement envoyée avec succès !" : "Payout request submitted successfully!", "success");
    }, 1500);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{isFrench ? "Chargement des statistiques..." : "Loading analytics..."}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">{isFrench ? "Échec du chargement des statistiques." : "Failed to load analytics data."}</div>;
  }

  const { totalRevenue, totalStudents, coursePerformance, recentTransactions: allTransactions, monthlyHistory, monthlyRevenue } = data;

  const filteredTransactions = allTransactions.filter(trx => {
    if (dateFilter === "all") return true;
    
    const trxDate = new Date(trx.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - trxDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (dateFilter === "7") return diffDays <= 7;
    if (dateFilter === "30") return diffDays <= 30;
    
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-3xl">
            {isFrench ? "Statistiques Formateur" : "Instructor analytics"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isFrench
              ? "Consultez les performances de vos formations, l'activité des apprenants et les revenus générés."
              : "Review course performance, learner activity, and revenue generated from your published courses."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as "all" | "7" | "30")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <option value="all" className="dark:bg-gray-800">{isFrench ? "Toute la période" : "All time"}</option>
            <option value="30" className="dark:bg-gray-800">{isFrench ? "Les 30 derniers jours" : "Last 30 days"}</option>
            <option value="7" className="dark:bg-gray-800">{isFrench ? "Les 7 derniers jours" : "Last 7 days"}</option>
          </select>
          <Link 
            href="/instructor/payouts"
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            <Wallet className="h-4 w-4" />
            {isFrench ? "Demander un virement" : "Request payout"}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="absolute -mr-4 -mt-4 h-24 w-24 rounded-bl-full bg-brand-500/10 right-0 top-0" />
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{isFrench ? "Solde disponible" : "Available balance"}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{(totalRevenue * 0.38).toFixed(2)}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +24%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{isFrench ? "Revenus totaux" : "Total revenue"}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{totalRevenue.toLocaleString(isFrench ? "fr-FR" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{isFrench ? "Virements en attente" : "Pending payouts"}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">€{(totalRevenue * 0.08).toFixed(2)}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp className="h-4 w-4" /> +5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">{isFrench ? "Apprenants inscrits" : "Learners enrolled"}</p>
            <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">{totalStudents}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPerformanceChart data={monthlyHistory} />
        </div>
        <div className="xl:col-span-1">
          {coursePerformance.length > 0 ? (
            <RevenueDistributionChart data={coursePerformance} />
          ) : (
            <div className="flex h-[350px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500">
                {isFrench ? "Aucune donnée de revenus pour les graphiques pour l'instant." : "No revenue data for charts yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              {isFrench ? "Transactions récentes" : "Recent transactions"}
            </h3>
            <p className="text-sm text-gray-500">
              {isFrench
                ? "Paiements d'inscriptions et achats de cours de vos apprenants"
                : "Enrollment payments and course purchases from your students"}
            </p>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || filteredTransactions.length === 0}
            className="flex items-center gap-2 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? (isFrench ? "Exportation..." : "Exporting...") : (isFrench ? "Exporter en PDF" : "Export PDF")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">{isFrench ? "ID Transaction" : "Transaction ID"}</th>
                <th className="px-6 py-4 font-semibold">{isFrench ? "Étudiant & formation" : "Student & course"}</th>
                <th className="px-6 py-4 font-semibold">{isFrench ? "Montant" : "Amount"}</th>
                <th className="px-6 py-4 font-semibold">{isFrench ? "Moyen de paiement" : "Method"}</th>
                <th className="px-6 py-4 font-semibold">{isFrench ? "Date" : "Date"}</th>
                <th className="px-6 py-4 text-right font-semibold">{isFrench ? "Statut" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">{trx.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800 dark:text-white/90">{trx.student}</div>
                    <div className="text-xs text-gray-500">{trx.course}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white/90">€{trx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{trx.method}</td>
                  <td className="px-6 py-4">{trx.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      trx.status === "Completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : trx.status === "Pending"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {trx.status === "Completed"
                        ? (isFrench ? "Terminé" : "Completed")
                        : trx.status === "Pending"
                        ? (isFrench ? "En attente" : "Pending")
                        : (isFrench ? "Échoué" : trx.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {isFrench ? "Aucune transaction trouvée." : "No transactions found."}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
          <Link href="/instructor/payouts" className="flex w-full items-center justify-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600">
            {isFrench ? "Voir tout l'historique des virements" : "View full history"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
