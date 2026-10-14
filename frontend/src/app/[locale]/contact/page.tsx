"use client";

import { useState } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { Mail, Clock, Send, MessageSquare, CheckCircle, HelpCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export default function ContactPage() {
  const locale = useLocale();
  const isFrench = locale === "fr";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(isFrench ? "Veuillez remplir tous les champs obligatoires." : "Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success(
        isFrench
          ? "Message envoyé avec succès ! Notre équipe vous répondra sous 24h."
          : "Message sent successfully! Our team will respond within 24 hours."
      );
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <HelpCircle className="w-4 h-4" />
              {isFrench ? "Centre d'Assistance" : "Support Center"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {isFrench ? "Contactez l'Équipe Yinga Academia" : "Get in Touch with Yinga Academia"}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {isFrench
                ? "Une question sur une formation, un paiement M-Pesa ou un compte formateur ? Nous sommes à votre écoute."
                : "Have a question about courses, M-Pesa checkout, or instructor applications? We're here to help."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Details Card */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {isFrench ? "Canaux Directs" : "Direct Channels"}
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-2xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isFrench ? "Support Général & Étudiants" : "General & Student Support"}
                      </h4>
                      <a href="mailto:support@yinga-academia.com" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                        support@yinga-academia.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-2xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isFrench ? "Délai de Réponse" : "Response Time"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isFrench ? "Généralement sous 24 heures ouvrées" : "Usually within 24 business hours"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-2xl">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isFrench ? "Partenariats & Formateurs" : "Instructors & Partnerships"}
                      </h4>
                      <a href="mailto:instructors@yinga-academia.com" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                        instructors@yinga-academia.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-6 dark:border-brand-900/30 dark:bg-brand-900/10">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                  {isFrench ? "Besoin d'aide sur un cours précis ?" : "Need help with an ongoing course?"}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {isFrench
                    ? "Vous pouvez également poser directement vos questions à votre enseignant depuis l'espace Q&A intégré à la salle de classe."
                    : "You can ask your instructor directly using the dedicated Q&A forum located beneath each course lesson."}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                {isSent ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isFrench ? "Message bien reçu !" : "Message Received!"}
                    </h3>
                    <p className="max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400">
                      {isFrench
                        ? "Merci de nous avoir contactés. Notre équipe d'assistance étudie votre demande et vous répondra sur votre adresse email dans les plus brefs délais."
                        : "Thank you for reaching out. Our support engineering team will inspect your inquiry and reply via email shortly."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSent(false);
                        setFormData({ name: "", email: "", subject: "general", message: "" });
                      }}
                      className="mt-4 px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors"
                    >
                      {isFrench ? "Envoyer un autre message" : "Send another message"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isFrench ? "Envoyez-nous un message" : "Send us a Message"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          {isFrench ? "Nom complet *" : "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isFrench ? "Ex: Sarah Connor" : "e.g. John Doe"}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          {isFrench ? "Adresse Email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="vous@exemple.com"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {isFrench ? "Sujet de la demande" : "Inquiry Subject"}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="general">{isFrench ? "Question générale" : "General Question"}</option>
                        <option value="payment">{isFrench ? "Paiement & M-Pesa" : "Payments & M-Pesa"}</option>
                        <option value="course">{isFrench ? "Accès à une formation" : "Course Access Issue"}</option>
                        <option value="instructor">{isFrench ? "Espace Formateur" : "Instructor Program"}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {isFrench ? "Votre message *" : "Your Message *"}
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={
                          isFrench
                            ? "Expliquez votre situation ou posez votre question en détail..."
                            : "Explain your question or situation with details..."
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-brand-600 hover:shadow-brand-500/25 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{isFrench ? "Envoi en cours..." : "Sending..."}</span>
                      ) : (
                        <>
                          <span>{isFrench ? "Envoyer le message" : "Send Message"}</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
