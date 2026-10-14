"use client";

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, BookOpen, ExternalLink, ChevronDown, Video, Send, CheckCircle2, X } from 'lucide-react';
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

export default function InstructorSupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    
    setSending(true);
    // Simulate backend API call
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setSubject("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Support</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Everything you need to succeed as a creator on our platform</p>
        </div>
      </div>

      {/* Support Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, title: "Creator Hub", desc: "Guides on course creation" },
          { icon: Video, title: "Video Guidelines", desc: "Quality standards & specs" },
          { icon: MessageSquare, title: "Instructor Forum", desc: "Connect with peers" },
          { icon: Mail, title: "Partner Support", desc: "Priority email assistance" },
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
            { q: "What is the revenue share model?", a: "Instructors receive 70% of the revenue from students they bring directly via instructor coupons, and 50% from organic platform sales. Payouts are processed monthly after a 30-day refund window." },
            { q: "How do I request a course review?", a: "Once you have uploaded all required video content and filled out the course landing page details, a 'Submit for Review' button will appear. The Quality Review Team typically processes submissions within 3-5 business days." },
            { q: "What are the video and audio requirements?", a: "Videos must be at least 720p HD resolution (1080p recommended). Audio must be clear, without distracting background noise. We strongly recommend using an external microphone rather than a built-in laptop mic." },
            { q: "How can I market my course?", a: "You can use promotional announcements, generate discount coupons to share on your social media, and utilize our built-in email marketing tools to reach your existing students when you launch a new course." }
          ].map((faq, index) => (
            <FAQItem key={index} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* Contact form CTA */}
      {!showForm && !sent && (
        <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/10 dark:to-brand-800/10 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Need dedicated assistance?</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg">
              As a verified instructor, you have access to priority support. Our team is ready to help you with technical issues, review feedback, or payout questions.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="whitespace-nowrap px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Contact Partner Support
          </button>
        </div>
      )}

      {showForm && !sent && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-md relative animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button 
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-500 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Partner Support</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
              >
                <option value="" disabled className="dark:bg-gray-800">Select a topic...</option>
                <option value="payouts" className="dark:bg-gray-800">Payouts & Revenue</option>
                <option value="review" className="dark:bg-gray-800">Course Review Process</option>
                <option value="technical" className="dark:bg-gray-800">Technical Issue (Video/Audio)</option>
                <option value="account" className="dark:bg-gray-800">Account Security</option>
                <option value="other" className="dark:bg-gray-800">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">How can we help?</label>
              <textarea 
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              />
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {sending ? <span className="animate-pulse">Sending...</span> : <Send className="w-4 h-4" />}
                {sending ? "" : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      )}

      {sent && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message Sent Successfully</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Thank you for reaching out to Partner Support. A specialist will review your request and get back to you within 24-48 hours.
          </p>
          <button 
            onClick={() => setSent(false)}
            className="mt-4 px-6 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
          >
            Send another message
          </button>
        </div>
      )}
    </div>
  );
}