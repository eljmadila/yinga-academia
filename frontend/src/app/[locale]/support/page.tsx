"use client";

import React, { useState } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import {
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export default function SupportPage() {
  const locale = useLocale();
  const isFrench = locale === "fr";

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: isFrench
        ? "Comment payer une formation avec M-Pesa ?"
        : "How do I pay for a course with M-Pesa?",
      a: isFrench
        ? "Lors de la commande, sélectionnez M-Pesa et entrez votre numéro de téléphone. Vous recevrez une notification sur votre mobile pour valider le paiement avec votre code PIN. L'accès au cours est activé immédiatement après confirmation."
        : "Select M-Pesa at checkout and enter your mobile number. You will receive an instant prompt on your phone to confirm with your PIN. Course access unlocks immediately upon confirmation."
    },
    {
      q: isFrench
        ? "Où puis-je télécharger mes certificats ?"
        : "Where can I download my certificates?",
      a: isFrench
        ? "Dès que vous terminez toutes les leçons d'un cours à 100%, votre certificat officiel PDF est disponible dans votre espace 'Mes Cours' et dans la salle de classe."
        : "Once you complete 100% of a course's lessons, your official PDF certificate becomes available in both 'My Courses' and inside the classroom."
    },
    {
      q: isFrench
        ? "Comment réinitialiser mon mot de passe ?"
        : "How do I reset my password?",
      a: isFrench
        ? "Cliquez sur 'Mot de passe oublié ?' sur la page de connexion, entrez votre email et vous recevrez un lien sécurisé pour créer un nouveau mot de passe."
        : "Click 'Forgot password?' on the login page, enter your email address, and you will receive a secure link to create a new password."
    },
    {
      q: isFrench
        ? "Comment contacter le formateur d'un cours ?"
        : "How do I ask questions to the course instructor?",
      a: isFrench
        ? "Chaque leçon dispose d'un espace Q&A dédié où vous pouvez poser vos questions directement au formateur et voir les réponses apportées aux autres étudiants."
        : "Every lesson includes a dedicated Q&A tab where you can post questions directly to the instructor and read discussions from other students."
    },
    {
      q: isFrench
        ? "Que faire si une vidéo ne se lance pas ?"
        : "What if a video doesn't load or buffer?",
      a: isFrench
        ? "Vérifiez votre connexion Internet et désactivez d'éventuels bloqueurs agressifs. Si le problème persiste, écrivez-nous ci-dessous avec le titre de la leçon."
        : "Check your internet connection and disable any restrictive ad-blockers. If the issue continues, reach out to us below with the lesson title."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(isFrench ? "Veuillez remplir tous les champs obligatoires." : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success(
        isFrench
          ? "Message envoyé avec succès ! Notre équipe vous répondra sous 24h."
          : "Message sent successfully! Our team will get back to you within 24h."
      );
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <PublicNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <HelpCircle className="w-4 h-4" />
            {isFrench ? "Support & Assistance" : "Support & Help Center"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {isFrench ? "Comment pouvons-nous vous aider ?" : "How can we help you?"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isFrench
              ? "Une question sur vos cours, vos paiements M-Pesa ou votre compte ? Contactez-nous ou consultez les réponses courantes ci-dessous."
              : "Have a question about courses, M-Pesa payments, or your account? Reach out to us or find quick answers below."}
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-400">Email</h4>
              <a
                href="mailto:support@yinga-academia.com"
                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                support@yinga-academia.com
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-400">WhatsApp</h4>
              <a
                href="https://wa.me/243000000000"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-green-500 transition-colors inline-flex items-center gap-1"
              >
                {isFrench ? "Discuter en direct" : "Chat on WhatsApp"} <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-semibold text-gray-400">
                {isFrench ? "Disponibilité" : "Response Time"}
              </h4>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isFrench ? "Lun - Sam, 8h - 19h" : "Within 24 business hours"}
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Form on Left, FAQs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {isFrench ? "Envoyez-nous un message" : "Send us a Message"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {isFrench
                ? "Remplissez ce formulaire et nous vous répondrons directement par email."
                : "Fill out the form below and we will reply to your email."}
            </p>

            {isSent ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {isFrench ? "Message envoyé avec succès !" : "Message Sent Successfully!"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {isFrench
                    ? "Merci pour votre message. Notre équipe d'assistance vous répondra très rapidement."
                    : "Thank you for reaching out. Our support team will respond shortly."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setName("");
                    setEmail("");
                    setSubject("general");
                    setMessage("");
                  }}
                  className="mt-2 px-5 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                >
                  {isFrench ? "Envoyer un autre message" : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isFrench ? "Votre nom *" : "Your name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isFrench ? "Ex: Sarah Connor" : "e.g. John Doe"}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isFrench ? "Adresse email *" : "Email address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isFrench ? "Sujet de votre demande" : "Subject"}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="general">{isFrench ? "Question générale" : "General question"}</option>
                    <option value="payment">{isFrench ? "Paiement & M-Pesa" : "Payments & M-Pesa"}</option>
                    <option value="course">{isFrench ? "Accès à un cours / Vidéo" : "Course / Video access"}</option>
                    <option value="certificate">{isFrench ? "Certificat de réussite" : "Certificate issue"}</option>
                    <option value="instructor">{isFrench ? "Espace Formateur" : "Instructor inquiries"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isFrench ? "Message *" : "Message *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isFrench
                        ? "Expliquez brièvement votre demande..."
                        : "Describe your question or issue..."
                    }
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? isFrench ? "Envoi en cours..." : "Sending..."
                    : isFrench ? "Envoyer le message" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Simple FAQs Accordion */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {isFrench ? "Questions fréquentes" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {isFrench
                ? "Les réponses aux questions les plus courantes de nos étudiants."
                : "Quick answers to our most common student inquiries."}
            </p>

            <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-900 dark:text-white group"
                    >
                      <span className="pr-4 group-hover:text-brand-500 transition-colors">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-brand-500" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed pr-6">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
