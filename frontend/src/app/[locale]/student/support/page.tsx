"use client";

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
      >
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition-colors">
          {q}
        </h4>
        <div className={`p-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-brand-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}

export default function StudentSupportPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">How can we help you today?</p>
        </div>
      </div>

      {/* Support Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, title: "Knowledge Base", desc: "Browse articles and guides" },
          { icon: MessageSquare, title: "Community Forum", desc: "Connect with other students" },
          { icon: Mail, title: "Email Support", desc: "Get help from our team" },
          { icon: ExternalLink, title: "System Status", desc: "Check if all systems are operational" },
        ].map((item, index) => (
          <div key={index} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/20 dark:group-hover:text-brand-400 transition-colors">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 mt-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        
        <div className="flex flex-col">
          {[
            { q: "How do I request a refund?", a: "You can request a refund within 30 days of your purchase by going to your Billing settings and selecting 'Request Refund' next to the eligible course. If approved, the funds will return to your original payment method within 5-7 business days." },
            { q: "Can I download courses for offline viewing?", a: "Currently, offline viewing is only available on our iOS and Android mobile apps. You can download individual lessons or entire modules to save storage space and watch on the go." },
            { q: "Where can I find my course certificates?", a: "Once you complete 100% of a course, your certificate will automatically appear in the 'Achievements' section of your profile. You can download it as a high-resolution PDF or share it directly to LinkedIn." },
            { q: "How do I contact an instructor?", a: "You can use the Q&A section inside any course to ask questions. Instructors typically respond within 24-48 hours. Please note that direct messaging is only available for premium mentorship courses." }
          ].map((faq, index) => (
            <FAQItem key={index} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* Contact form CTA */}
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/10 dark:to-brand-800/10 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Still need help?</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg">
            Can't find the answer you're looking for? Our dedicated support team is here to help with any technical issues or billing questions you might have.
          </p>
        </div>
        <button className="whitespace-nowrap px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
          Contact Support
        </button>
      </div>
    </div>
  );
}