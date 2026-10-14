import type { Metadata } from "next";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { Shield, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation (Terms of Service) | Yinga Academia",
  description: "Conditions générales d'utilisation régissant l'accès et les services de la plateforme Yinga Academia.",
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === "fr";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {isFrench ? "Conditions Générales d'Utilisation" : "Terms of Service"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isFrench
                  ? "Dernière mise à jour : 13 Octobre 2026"
                  : "Last updated: October 13, 2026"}
              </p>
            </div>
          </div>

          <div className="prose prose-brand dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-300">
            {isFrench ? (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">1.</span> Acceptation des conditions
                  </h2>
                  <p className="leading-relaxed">
                    En accédant à la plateforme Yinga Academia, en créant un compte ou en souscrivant à un cours (gratuit ou payant), vous acceptez sans réserve d&apos;être lié par les présentes conditions générales d&apos;utilisation, notre politique de confidentialité et toutes les lois applicables.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">2.</span> Comptes et Rôles Utilisateurs
                  </h2>
                  <p className="leading-relaxed">
                    Yinga Academia propose des comptes dédiés aux <strong>Étudiants (Learners)</strong> et aux <strong>Formateurs (Instructors)</strong>. Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vous vous engagez à fournir des informations exactes lors de l&apos;inscription.</li>
                    <li>Le partage d&apos;identifiants de compte ou l&apos;accès simultané non autorisé est formellement prohibé.</li>
                    <li>Les instructeurs garantissent détenir tous les droits de propriété intellectuelle sur les contenus et vidéos mis en ligne.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">3.</span> Inscription aux Cours, Tarifs et Paiements
                  </h2>
                  <p className="leading-relaxed">
                    Les cours sont proposés sous format gratuit ou payant. Les paiements s&apos;effectuent de façon sécurisée via nos prestataires agréés, incluant <strong>M-Pesa (Daraja STK Push)</strong> et Flutterwave.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>L&apos;accès au cours payant est accordé immédiatement après confirmation serveur définitive du paiement par le prestataire.</li>
                    <li>Toute tentative de manipulation des statuts de paiement ou contournement API entraîne la suspension immédiate du compte.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">4.</span> Politique de Remboursement
                  </h2>
                  <p className="leading-relaxed">
                    Les étudiants peuvent demander un remboursement dans un délai de <strong>30 jours</strong> suivant la date d&apos;achat d&apos;un cours, à condition que moins de 25% du contenu du cours n&apos;ait été visionné et qu&apos;aucun certificat de réussite n&apos;ait été émis. Les demandes sont soumises à examen de conformité.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">5.</span> Propriété Intellectuelle et Streaming
                  </h2>
                  <p className="leading-relaxed">
                    Les vidéos de cours, supports de formation, devoirs et logos hébergés sur Yinga Academia sont protégés par le droit d&apos;auteur. Les étudiants reçoivent une licence personnelle, non exclusive et non transférable pour visionner les contenus à des fins d&apos;apprentissage personnel.
                  </p>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl text-sm">
                    <strong>Avertissement :</strong> Tout téléchargement non autorisé, réenregistrement, extraction de flux HLS/MP4 ou redistribution publique de vidéos sans accord écrit est passible de poursuites judiciaires.
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">6.</span> Certificats de Réussite
                  </h2>
                  <p className="leading-relaxed">
                    Les certificats de complétion (générés en format PDF sécurisé) attestent de la validation à 100% des leçons composant le cursus. Ils sont nominatifs et vérifiables par les employeurs sur demande.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">7.</span> Contact et Juridiction
                  </h2>
                  <p className="leading-relaxed">
                    Pour toute question relative aux présentes conditions ou pour tout signalement d&apos;abus, contactez notre équipe juridique à <strong>legal@yinga-academia.com</strong> ou via notre formulaire de support.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">1.</span> Acceptance of Terms
                  </h2>
                  <p className="leading-relaxed">
                    By accessing Yinga Academia, registering an account, or enrolling in any free or paid course, you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable statutory regulations.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">2.</span> User Accounts and Roles
                  </h2>
                  <p className="leading-relaxed">
                    Yinga Academia provides dedicated accounts for <strong>Students</strong> and <strong>Instructors</strong>. You are responsible for preserving credentials confidentiality and for all operations executed under your authentication token.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You must provide accurate, up-to-date registration details.</li>
                    <li>Credential sharing, account reselling, or concurrent unauthorized access is strictly prohibited.</li>
                    <li>Instructors warrant full copyright ownership over all curriculum media and educational materials published.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">3.</span> Enrollment, Pricing, and Payments
                  </h2>
                  <p className="leading-relaxed">
                    Courses are listed with verified free or paid pricing. Payments are executed securely via certified payment gateways, including <strong>M-Pesa (Daraja STK Push)</strong> and Flutterwave.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Paid course enrollment is provisioned only upon authoritative server-side callback verification.</li>
                    <li>Any attempt to forge payment statuses, bypass webhook validation, or tamper with transaction signatures will result in immediate termination.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">4.</span> Refund Policy
                  </h2>
                  <p className="leading-relaxed">
                    Students may request a refund within <strong>30 days</strong> of course purchase provided that less than 25% of course lessons have been viewed and no completion certificate has been issued.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">5.</span> Intellectual Property and Media Streaming
                  </h2>
                  <p className="leading-relaxed">
                    All video lectures, syllabus materials, and branding displayed on Yinga Academia are protected by international copyright laws. Learners are granted a limited, personal, non-transferable license to stream content for individual education.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">6.</span> Certificates of Completion
                  </h2>
                  <p className="leading-relaxed">
                    Official completion certificates (delivered as authenticated PDFs) are unlocked exclusively upon completing 100% of course lessons. Certificates remain tied to the verified student profile.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">7.</span> Contact & Governing Law
                  </h2>
                  <p className="leading-relaxed">
                    For legal inquiries, intellectual property notices, or compliance questions, reach our compliance team at <strong>legal@yinga-academia.com</strong>.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
