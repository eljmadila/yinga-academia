"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, PhoneCall, Send, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SupportPage({ role }: { role: "student" | "instructor" }) {
  const t = useTranslations("support");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("");

  const faqs = role === "instructor" 
    ? [
        { question: t("instructorFaqQ1"), answer: t("instructorFaqA1") },
        { question: t("instructorFaqQ2"), answer: t("instructorFaqA2") },
        { question: t("instructorFaqQ3"), answer: t("instructorFaqA3") },
      ]
    : [
        { question: t("faqQ1"), answer: t("faqA1") },
        { question: t("faqQ2"), answer: t("faqA2") },
        { question: t("faqQ3"), answer: t("faqA3") },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setMessage("");
      setSubject("");
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 dark:text-white pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact Cards & Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 rounded-full bg-brand-50 p-3 inline-block dark:bg-brand-500/10">
                <Mail className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("emailTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("emailDesc")}</p>
              <a href="mailto:support@yinga-academia.com" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">support@yinga-academia.com</a>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 rounded-full bg-brand-50 p-3 inline-block dark:bg-brand-500/10">
                <PhoneCall className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("phoneTitle")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("phoneDesc")}</p>
              <a href="tel:+33123456789" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">+33 1 23 45 67 89</a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              {t("formTitle")}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "success" && (
                <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400">
                  {t("successMessage")}
                </div>
              )}
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("subjectLabel")}</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder={role === "student" ? t("subjectStudentPlaceholder") : t("subjectInstructorPlaceholder")}
                  className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:focus:border-brand-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("messageLabel")}</label>
                <textarea 
                  rows={5}
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder={t("messagePlaceholder")}
                  className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:focus:border-brand-500 resize-none" 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={status === "sending"}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  t("sendingBtn")
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("sendBtn")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: FAQ */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-500" />
              {t("faqTitle")}
            </h2>
            
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === index ? "auto" : 0, opacity: openFaq === index ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent">
                      {faq.answer}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-center">
              <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
                {t("noAnswerTitle")}
              </p>
              <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mt-1">
                {t("noAnswerDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
