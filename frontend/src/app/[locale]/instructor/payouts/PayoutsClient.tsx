"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, ChevronRight, ChevronDown, CheckCircle2, Plus, XCircle } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RevenueAreaChart } from "@/components/instructor/AnalyticsCharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PayoutRequest {
  id: number;
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED';
  bank_account_info: string;
  created_at: string;
}

export default function PayoutsClient({ token }: { token: string | undefined }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [chartFilter, setChartFilter] = useState("year");

  const faqs = [
    {
      id: "payouts",
      question: "Understanding Payouts",
      answer: "Payouts are processed automatically on the 1st of every month for the earnings from the previous month. You need a minimum balance of €50 to be eligible."
    },
    {
      id: "tax",
      question: "Tax Documentation",
      answer: "Your 1099 or equivalent tax forms will be available to download from this page by January 31st each year. Ensure your tax details are up to date."
    },
    {
      id: "support",
      question: "Contact Billing Support",
      answer: "If you have issues with a missing payout or incorrect earnings, please contact our support team at billing@platform.com."
    }
  ];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) return;
    
    Promise.all([
      fetch(`${API_URL}/api/analytics/instructor/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/api/instructors/payouts/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
    .then(([analyticsData, payoutsData]) => {
      setAnalytics(analyticsData);
      setPayouts(payoutsData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleWithdraw = async () => {
    if (!analytics) return;
    const availableBalance = analytics.totalRevenue * 0.38;
    if (availableBalance <= 0) {
      showToast("No funds available to withdraw.", "error");
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch(`${API_URL}/api/instructors/payouts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: availableBalance,
          bank_account_info: "Primary Visa ending in 4242"
        })
      });

      if (res.ok) {
        const newPayout = await res.json();
        setPayouts([newPayout, ...payouts]);
        showToast("Payout requested successfully!", "success");
      } else {
        showToast("Failed to request payout.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExportPDF = () => {
    if (payouts.length === 0) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Payout History", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      const headers = [["Date", "Destination", "Amount", "Status"]];
      const pdfData = payouts.map(p => [
        new Date(p.created_at).toLocaleDateString(),
        p.bank_account_info || 'Default Account',
        `€${p.amount}`,
        p.status
      ]);

      autoTable(doc, {
        startY: 36,
        head: headers,
        body: pdfData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`payouts_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      showToast("Failed to export PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading payouts data...</div>;
  }

  const totalEarnings = analytics?.totalRevenue || 0;
  const availableBalance = totalEarnings * 0.38;
  const pendingPayouts = totalEarnings * 0.08;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings & Payouts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your revenue and manage your payout methods</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || payouts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          <button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || availableBalance <= 0}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isWithdrawing ? "Processing..." : "Withdraw Funds"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Available Balance</h3>
            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">€{availableBalance.toFixed(2)}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ready to be withdrawn</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Earnings</h3>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">€{totalEarnings.toFixed(2)}</h2>
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-medium">+15.3%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Next Payout</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1st of Month</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated: €{pendingPayouts.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area: Chart and Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <select 
                value={chartFilter}
                onChange={(e) => setChartFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 dark:text-gray-300"
              >
                <option value="year">This Year</option>
                <option value="3months">Last 3 Months</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
            <div className="w-full">
              {analytics?.monthlyHistory ? (
                <RevenueAreaChart 
                  data={
                    chartFilter === "year" 
                      ? analytics.monthlyHistory 
                      : chartFilter === "3months"
                        ? analytics.monthlyHistory.slice(-3)
                        : analytics.monthlyHistory.slice(-1)
                  } 
                />
              ) : (
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payout Requests */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payout History</h3>
              <button className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Destination</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No payout history.
                      </td>
                    </tr>
                  ) : (
                    payouts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">Bank Payout</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.bank_account_info || 'Default Account'}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">€{p.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            p.status === 'PAID' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            p.status === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Payout Settings */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payout Method</h3>
            
            <div className="p-4 border border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl flex items-start gap-4 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1.5 bg-brand-500 text-white rounded-bl-lg">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shrink-0">
                <CreditCard className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Visa ending in 4242</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Expires 12/28</p>
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/30 px-2 py-0.5 rounded">Primary</span>
              </div>
            </div>

            <button 
              onClick={() => showToast("Add Payment Method feature is simulated in this MVP.", "success")}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Payment Method
            </button>
          </div>

          {/* Help & Resources FAQ */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Help & Resources</h3>
            <div className="space-y-3">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{faq.question}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-brand-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-3 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
              <CheckCircle2 className="w-5 h-5 text-green-500" />
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
