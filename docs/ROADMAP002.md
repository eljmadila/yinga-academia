# 🚀 ROADMAP 002 : Vers la Version de Production

Ce document présente le diagnostic complet de l'état actuel de **Yinga Academia** (Frontend, Backend, UI/UX) et définit la feuille de route stratégique pour amener le projet jusqu'au lancement final.

---

## 📊 1. Diagnostic de l'État Actuel

### 🎨 UI / UX (Frontend)
- **Le Positif** : Le design a pivoté vers une esthétique ultra-premium (animations `framer-motion`, composants Shadcn UI, design épuré type Glassmorphism). La corruption de Turbopack a été vaincue, et toutes les pages majeures sont recréées avec cette nouvelle identité visuelle.
- **Le Manque** : Bien que les pages `Catalog`, `Dashboard Étudiant` et `Dashboard Instructeur` soient connectées au backend, d'autres (comme l'éditeur de cours, la messagerie Q&A et les paiements) utilisent encore des données simulées (mock data) pour l'affichage. Le lecteur vidéo n'a pas encore été testé avec de vraies vidéos chunkées.

### ⚙️ Backend (Django REST Framework)
- **Le Positif** : L'architecture est très solide. Les applications (`courses`, `students`, `instructors`, `payments`) sont bien segmentées. Les webhooks (M-Pesa, Flutterwave) sont codés de manière sécurisée, et l'upload de vidéos par morceaux (chunked upload) est prêt dans `views.py`.
- **Le Manque** : 
  1. Les paiements ne sont pas testés en "conditions réelles" (nécessite l'ouverture d'un tunnel Ngrok pour les webhooks).
  2. Il manque peut-être la gestion d'envoi d'e-mails réels (SMTP / SendGrid) pour les reçus de paiement et la validation des comptes.

---

## 🗺️ 2. Feuille de Route (Plan d'Action Détaillé)

### 🟢 Phase 1 : Connectivité Totale (Data Binding)
*Objectif : Éliminer 100% des données simulées sur le frontend.*

- [ ] **Éditeur de Cours (Instructeur)** : Connecter la page `/instructor/courses/[id]/edit` aux endpoints `/api/courses/`, `/api/modules/` et `/api/lessons/`.
- [ ] **Upload Vidéo** : Implémenter le script React permettant d'envoyer de gros fichiers vidéo via l'API `ChunkedVideoUploadView` existante dans Django.
- [ ] **Q&A & Interactions** : Lier la page de Questions/Réponses (`/instructor/qa`) à `QuestionViewSet` et `AnswerViewSet`.
- [ ] **Demandes de Paiement (Payouts)** : Lier la page `Payouts` à `PayoutRequestViewSet` pour que les instructeurs puissent réellement demander le retrait de leurs revenus.

### 🟡 Phase 2 : Le Flux de Paiement (Checkout & Webhooks)
*Objectif : Avoir un tunnel de vente parfaitement opérationnel et sécurisé.*

- [ ] **Tunnel Ngrok** : Installer et configurer Ngrok sur l'environnement de développement local pour exposer le port `8000`.
- [ ] **Test M-Pesa STK Push** : Effectuer un achat réel depuis un téléphone mobile et vérifier que le webhook met à jour le statut dans Django et débloque le cours.
- [ ] **Test Flutterwave** : Valider le flux complet (redirection, paiement, webhook `charge.completed`, retour sur le dashboard étudiant).
- [ ] **Factures / Reçus** : Implémenter l'envoi d'un e-mail de confirmation après un paiement réussi.

### 🟠 Phase 3 : Le Lecteur Vidéo & La Progression
*Objectif : Garantir une expérience d'apprentissage fluide pour les étudiants.*

- [ ] **Lecteur Vidéo Premium** : Intégrer un lecteur vidéo personnalisé (ex: `video.js` ou un lecteur React custom) gérant la qualité, la vitesse de lecture et la mémorisation du temps de visionnage.
- [ ] **Suivi de Progression** : S'assurer que lorsqu'une vidéo est terminée, l'API `/api/progress/` est appelée pour cocher la leçon, ce qui mettra à jour la jauge de progression.
- [ ] **Génération de Certificat** : Lier la page de certificat à une fonction backend (ex: `reportlab` en Python) générant un véritable PDF téléchargeable lorsqu'un cours atteint 100%.

### 🟣 Phase 4 : Polish UI/UX, i18n & Performance
*Objectif : Rendre la plateforme irréprochable avant le lancement public.*

- [ ] **Harmonisation i18n** : Régler le conflit potentiel identifié entre `middleware.ts` et la configuration `next-intl` (`localePrefix: "never"`). S'assurer que la traduction (FR/EN) marche partout sans bug d'URL.
- [ ] **Responsive Design** : Faire un passage complet sur mobile (iPhone/Android) pour vérifier la Sidebar, les tableaux, et l'éditeur de cours.
- [ ] **Thème Sombre (Dark Mode)** : Peaufiner les couleurs `brand-500` et les bordures dans le thème sombre pour garantir un contraste parfait.
- [ ] **Optimisation SEO** : Ajouter les balises `<title>`, `<meta>` dynamiques via la nouvelle API Next.js `generateMetadata` sur les pages publiques (Catalogue, Profil Instructeur, Page d'accueil).

### 🚀 Phase 5 : Déploiement Production
- [ ] **Base de données** : Migrer de SQLite vers PostgreSQL.
- [ ] **Hébergement Frontend** : Déployer sur Vercel.
- [ ] **Hébergement Backend** : Déployer sur Railway, Render ou AWS (avec un bucket S3 pour le stockage des vidéos et des images).
- [ ] **Configuration des Domaines** : Lier le domaine principal (ex: `yinga-academia.com`) et sécuriser via SSL.

---
*Ce document sert de nouvelle référence de base pour amener Yinga Academia en production. Chaque étape pourra être abordée individuellement pour assurer une qualité optimale.*
