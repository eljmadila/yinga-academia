import type { Metadata } from "next";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { Shield, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité (Privacy Policy) | Yinga Academia",
  description: "Politique de traitement, de protection des données et de confidentialité des utilisateurs de Yinga Academia.",
};

export default async function PrivacyPage({
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {isFrench ? "Politique de Confidentialité" : "Privacy Policy"}
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
                    <span className="text-brand-500">1.</span> Collecte des Données Personnelles
                  </h2>
                  <p className="leading-relaxed">
                    Nous collectons uniquement les informations indispensables au fonctionnement de vos services d&apos;apprentissage et de paiement :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Données de profil :</strong> Nom, prénom, adresse e-mail, photo de profil et biographie.</li>
                    <li><strong>Données de navigation et d&apos;apprentissage :</strong> Modules consultés, vidéos lues, timecode de reprise, validations de quiz et progression globale.</li>
                    <li><strong>Données de transaction :</strong> Numéro de téléphone mobile (M-Pesa pour l&apos;émission du STK Push), identifiants d&apos;ordre et références de paiement.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">2.</span> Traitement des Paiements et Sécurité Financière
                  </h2>
                  <p className="leading-relaxed">
                    Yinga Academia <strong>ne conserve jamais</strong> vos mots de passe bancaires ou vos codes PIN Mobile Money. Les flux financiers sont délégués directement aux infrastructures certifiées de Safaricom Daraja et de Flutterwave sous chiffrement TLS/HTTPS de bout-en-bout.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">3.</span> Utilisation des Cookies et Tokens
                  </h2>
                  <p className="leading-relaxed">
                    Notre plateforme utilise des cookies de session strictement nécessaires et des tokens JWT pour :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Maintenir votre session d&apos;authentification active de manière sécurisée (cookies HttpOnly et SameSite).</li>
                    <li>Mémoriser vos préférences linguistiques (Français / Anglais).</li>
                    <li>Protéger l&apos;application contre les attaques de type falsification de requête (CSRF).</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">4.</span> Conservation et Sécurité des Données
                  </h2>
                  <p className="leading-relaxed">
                    Vos données sont hébergées sur des bases de données isolées (PostgreSQL géré avec sauvegardes automatisées et chiffrement au repos). Les vidéos et fichiers multimédias sont protégés contre les accès anonymes directs via des contrôles stricts de droits d&apos;inscription.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">5.</span> Vos Droits (Accès, Rectification, Suppression)
                  </h2>
                  <p className="leading-relaxed">
                    Conformément aux normes internationales de protection des données (RGPD et législations locales), vous disposez du droit d&apos;accéder, de corriger ou de demander la suppression de votre compte et de vos données personnelles à tout moment en écrivant à <strong>privacy@yinga-academia.com</strong>.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">1.</span> Personal Data We Collect
                  </h2>
                  <p className="leading-relaxed">
                    We only collect information strictly required to operate your learning journeys and process verified course transactions:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Account identity:</strong> First name, last name, email address, avatar picture, and bio.</li>
                    <li><strong>Learning metrics:</strong> Completed lessons, video playhead timecodes, progress milestones, and certificate generation logs.</li>
                    <li><strong>Transaction records:</strong> Mobile phone number (for M-Pesa STK Push authorization), order identifiers, and payment status callbacks.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">2.</span> Payment Security & Third Parties
                  </h2>
                  <p className="leading-relaxed">
                    Yinga Academia <strong>never stores</strong> payment PINs, card security codes, or banking secrets. Financial requests are processed through PCI-DSS compliant providers (Safaricom Daraja, Flutterwave) via end-to-end encrypted HTTPS channels.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">3.</span> Cookies and Authentication Tokens
                  </h2>
                  <p className="leading-relaxed">
                    We use secure JWT access cookies and local storage tokens to preserve authenticated sessions across role boundaries, remember preferred language (English or French), and protect transactions from CSRF vulnerabilities.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">4.</span> Data Retention and Encryption
                  </h2>
                  <p className="leading-relaxed">
                    Data is persisted in production-grade managed PostgreSQL databases with automated daily point-in-time recovery and encryption at rest. Private curriculum videos require active enrollment tokens before streaming.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-brand-500">5.</span> Your Privacy Rights
                  </h2>
                  <p className="leading-relaxed">
                    You maintain the right to inspect, export, correct, or delete your account credentials and personal records. For data inquiries, reach out to <strong>privacy@yinga-academia.com</strong>.
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
