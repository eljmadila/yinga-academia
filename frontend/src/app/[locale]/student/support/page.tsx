"use client";

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, FileText, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const isFrench = locale === "fr";

  const categories = [
    {
      icon: FileText,
      title: isFrench ? "Base de connaissances" : "Knowledge Base",
      desc: isFrench ? "Consultez nos articles et guides détaillés" : "Browse articles and guides",
    },
    {
      icon: MessageSquare,
      title: isFrench ? "Forum communautaire" : "Community Forum",
      desc: isFrench ? "Échangez avec d'autres étudiants" : "Connect with other students",
    },
    {
      icon: Mail,
      title: isFrench ? "Support par e-mail" : "Email Support",
      desc: isFrench ? "Obtenez de l'aide de notre équipe dédiée" : "Get help from our team",
    },
    {
      icon: ExternalLink,
      title: isFrench ? "Statut du système" : "System Status",
      desc: isFrench ? "Vérifiez la disponibilité de nos services" : "Check if all systems are operational",
    },
  ];

  const faqs = [
    {
      q: isFrench ? "Comment demander un remboursement ?" : "How do I request a refund?",
      a: isFrench
        ? "Vous pouvez demander un remboursement dans les 30 jours suivant votre achat. Une fois approuvé, les fonds sont crédités sur votre moyen de paiement sous 5 à 7 jours ouvrés."
        : "You can request a refund within 30 days of your purchase by going to your Billing settings and selecting 'Request Refund' next to the eligible course. If approved, the funds will return to your original payment method within 5-7 business days.",
    },
    {
      q: isFrench ? "Puis-je télécharger les cours pour un visionnage hors ligne ?" : "Can I download courses for offline viewing?",
      a: isFrench
        ? "Le visionnage hors ligne est disponible sur nos applications mobiles. Vous pouvez télécharger des leçons individuelles pour les regarder en déplacement sans connexion internet."
        : "Currently, offline viewing is only available on our iOS and Android mobile apps. You can download individual lessons or entire modules to save storage space and watch on the go.",
    },
    {
      q: isFrench ? "Où puis-je trouver mes certificats de formation ?" : "Where can I find my course certificates?",
      a: isFrench
        ? "Dès que vous avez terminé 100 % d'une formation, votre certificat officiel devient immédiatement disponible en téléchargement PDF haute résolution depuis la page de certificat du cours."
        : "Once you complete 100% of a course, your certificate will automatically appear in the 'Achievements' section of your profile. You can download it as a high-resolution PDF or share it directly to LinkedIn.",
    },
    {
      q: isFrench ? "Comment contacter un formateur ?" : "How do I contact an instructor?",
      a: isFrench
        ? "Vous pouvez utiliser l'onglet Questions / Réponses dans chaque leçon pour poser vos questions au formateur. Les formateurs répondent généralement sous 24 à 48 heures."
        : "You can use the Q&A section inside any course to ask questions. Instructors typically respond within 24-48 hours. Please note that direct messaging is only available for premium mentorship courses.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isFrench ? "Aide & Support" : "Help & Support"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isFrench ? "Comment pouvons-nous vous aider aujourd'hui ?" : "How can we help you today?"}
          </p>
        </div>
      </div>

      {/* Support Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((item, index) => (
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {isFrench ? "Foire Aux Questions" : "Frequently Asked Questions"}
        </h2>
        
        <div className="flex flex-col">
          {faqs.map((faq, index) => (
            <FAQItem key={index} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* Contact form CTA */}
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/10 dark:to-brand-800/10 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isFrench ? "Encore besoin d'aide ?" : "Still need help?"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg">
            {isFrench
              ? "Vous ne trouvez pas la réponse souhaitée ? Notre équipe d'assistance dédiée est à votre disposition pour vous aider."
              : "Can't find the answer you're looking for? Our dedicated support team is here to help with any technical issues or billing questions you might have."}
          </p>
        </div>
        <Link
          href="/contact"
          className="whitespace-nowrap px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-center"
        >
          {isFrench ? "Contacter le support" : "Contact Support"}
        </Link>
      </div>
    </div>
  );
}