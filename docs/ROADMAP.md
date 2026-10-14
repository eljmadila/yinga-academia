# Roadmap & Plan d'Action (Production-Ready) - Yinga Academia

Ce document détaille l'ensemble des fonctionnalités à développer pour finaliser la plateforme Yinga Academia et la rendre prête pour un lancement commercial (Production-Ready). 

---

## 🎨 Phase 0 : UX/UI Polish & Standard Premium (Priorité Absolue)
**Objectif :** Atteindre les standards de design d'applications Ed-Tech (Udemy, Masterclass) avec une UX irréprochable.
- [x] **États de Chargement (Skeletons)** : Appliquer `PageLoader` (Skeleton animé avec Tailwind) sur l'ensemble de l'application (Étudiant et Formateur) pour supprimer les "Chargement...".
- [x] **Notifications (Toasts)** : Intégrer `sonner` ou `react-hot-toast` pour remplacer les `alert()` natifs et offrir des retours visuels élégants.
- [x] **Micro-animations (Framer Motion)** : Finaliser l'intégration des transitions de pages (fade-in, slide-up) pour une navigation fluide.
- [x] **Validation des Formulaires** : Remplacer les vérifications basiques par `Zod` et `React Hook Form` avec des messages d'erreur clairs en rouge sous les champs.
- [x] **Empty States Premium** : Ajouter de belles illustrations SVG avec des appels à l'action (Call to Action) pour tous les tableaux et listes vides.

---

## 🚀 Phase 3 : Cœur Métier & Parcours Utilisateur

### Étape 3.1 : L'Interface d'Apprentissage (Lecteur LMS) 🔴 CRITIQUE
**Objectif :** L'espace de consommation du cours, optimisé pour l'apprentissage.
- [x] **Lecteur Vidéo Pro** : Remplacer la balise `<video>` basique par un lecteur robuste (ex: *Plyr* ou *Video.js*) permettant le réglage de la qualité et de la vitesse (x1.5, x2).
- [x] **Backend** : Création de l'application `progress` (API pour sauvegarder et récupérer l'avancée de l'étudiant).
- [x] **Frontend** : Dashboard d'apprentissage (Lecteur central + Liste de leçons latérale).
- [x] **Coche automatique** : Marquer la leçon comme terminée à la fin de la vidéo et sauvegarder le timecode pour la reprise de lecture.

### Étape 3.2 : Système de Paiement Multi-Passerelles (Flutterwave & M-Pesa Daraja) 🔴 CRITIQUE
**Objectif :** Offrir une expérience d'achat optimisée pour l'Afrique (Mobile Money et Cartes), et automatiser l'inscription aux cours.
- [x] **Backend - Architecture Commune** : 
  - [x] Création et mise à jour des modèles `Order`, `Payment`, et `Enrollment`.
  - [x] Implémentation d'un gestionnaire de statut de commande (En attente, Complété, Échoué).
- [x] **Backend - Intégration Flutterwave** :
  - [x] Configuration de l'API Flutterwave v3 (clés publiques/secrètes test/prod).
  - [x] Implémentation du endpoint pour générer le lien de paiement (standard) ou le composant in-line.
  - [x] Mise en place et sécurisation des Webhooks Flutterwave pour valider les paiements asynchrones.
- [x] **Backend - Intégration Daraja (M-Pesa)** :
  - [x] Configuration de l'API Daraja (Consumer Key, Secret, Passkey, Shortcode).
  - [x] Implémentation de M-Pesa Express (STK Push) pour déclencher le paiement directement sur le téléphone de l'étudiant.
  - [x] Configuration de l'URL de Callback (Webhook Daraja) sécurisée pour confirmer la transaction.
- [x] **Frontend - Tunnel d'Achat (Checkout)** :
  - [x] Interface de sélection de la méthode de paiement (UI/UX premium pour choisir entre Flutterwave et M-Pesa).
  - [x] Intégration du checkout Flutterwave (Redirection ou modal in-line `flutterwave-react-v3`).
  - [x] Formulaire de saisie du numéro de téléphone pour le STK Push M-Pesa avec indicateur de chargement actif ("Veuillez valider sur votre téléphone...").
  - [x] Gestion fluide des états (chargement, timeout M-Pesa, erreurs de paiement claires, validation).
- [x] **Post-Paiement (Succès & Accès)** : 
  - [x] Page de confirmation de commande premium.
  - [x] Déblocage automatique de l'accès à la formation pour l'étudiant via webhooks.

### Étape 3.3 : Exploration et Détails du Cours (Vitrine)
**Objectif :** Donner envie aux étudiants d'acheter un cours avec une belle vitrine.
- [x] **Frontend** : Page `/student/courses/[courseId]` finalisée (Page de présentation premium façon Udemy).
- [x] **Frontend** : Intégration d'un lecteur vidéo pour lire la "Bande-annonce" gratuite du cours.
- [x] **Frontend** : Affichage du syllabus dynamique (liste des chapitres déroulants).

---

## 💡 Phase 4 : Engagement & Preuve Sociale

### Étape 4.1 : Système d'Avis (Reviews) 🟡 IMPORTANT
**Objectif :** Améliorer la crédibilité du catalogue.
- [x] **Backend** : Modèle `Review` (Note sur 5 étoiles + texte) créé.
- [x] **Frontend** : Intégrer les étoiles sur le catalogue et sur la fiche d'un cours.
- [x] **Frontend** : Modale demandant à l'étudiant de noter le cours une fois 50% du contenu visionné.

### Étape 4.2 : Système de Questions/Réponses (Q&A)
**Objectif :** Favoriser l'interaction entre formateurs et étudiants.
- [x] **Backend** : Modèles `Question` et `Answer` liés à une leçon spécifique.
- [x] **Frontend** : Onglet "Questions" en dessous du lecteur vidéo étudiant. Notification dans le dashboard formateur.

### Étape 4.3 : Certificats de Réussite
**Objectif :** Récompenser la complétion d'un cours.
- [x] **Backend** : Génération de fichier PDF dynamique (ex: reportlab).
- [x] **Frontend** : Bouton de téléchargement débloqué automatiquement lors de la complétion à 100%.

---

## 🛠️ Phase 5 : Sécurité, Performance & Déploiement

### Étape 5.1 : Hébergement Médias et Sécurité Anti-Piratage 🔴 CRITIQUE
- [ ] Connecter Django à **AWS S3** ou **Cloudflare Stream** pour décharger le serveur principal du poids des vidéos.
- [ ] Protéger le contenu via l'encodage HLS (HTTP Live Streaming) et des URLs signées pour contrer le téléchargement illégal.

### Étape 5.2 : Panel Administrateur & SEO
- [x] Adapter le back-office `Django Admin` pour modérer/approuver les cours manuellement.
- [x] Injecter des balises Meta dynamiques (Titre, Description, OpenGraph) sur les pages publiques (Catalogue et Détails du Cours) pour le SEO.

### Étape 5.3 : Internationalisation Complète (i18n) 🟡 IMPORTANT
- [x] Extraire tous les textes statiques ("en dur") restants des fichiers `.tsx` du frontend. *(En cours - Analytics & Payouts terminés)*
- [x] Remplir `fr.json` et `en.json` avec les clés manquantes pour une traduction à 100%. *(En cours)*
- [x] S'assurer que chaque lien de navigation préserve le paramètre de langue (`/[locale]/`) via `next-intl`. *(En cours)*

### Étape 5.4 : Tests & Qualité (Production-Ready) 🔴 CRITIQUE
- [ ] Remplacer les fausses données de test (mock) par de vraies requêtes backend complètes (ex: filtres par date dynamiques sur les Analytics).
- [ ] Écrire les tests unitaires backend (Pytest/Django) pour les flux d'argent : paiements M-Pesa Daraja et demandes de retrait.
- [ ] Écrire des tests frontend (Jest/Playwright) pour valider l'expérience étudiant (achat de cours, lecture de vidéo).

---

> **Note stratégique d'avancement :**
> L'espace Formateur, l'espace Étudiant et la Landing Page ont atteint un niveau premium très satisfaisant. La priorité immédiate se tourne désormais vers la **Phase 5 (Sécurité, Internationalisation & Tests)** pour finaliser l'application avant son déploiement sur les serveurs de production.
