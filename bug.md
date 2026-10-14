# 🐞 Rapport de Diagnostic du Projet

Ce document présente une analyse complète des bugs rencontrés dans l'application, leurs causes, et les actions correctives mises en place ou requises.

## 1. 🛑 Bug Majeur : Corruption du Cache Next.js (Turbopack)

**Description du problème :**
Le compilateur Next.js (spécifiquement avec Turbopack sous Windows) a un comportement instable qui a conduit à la suppression du contenu de plus de 70 fichiers source (fichiers transformés en 0 octet ou remplacés par des stubs `registerClientReference`).

**Conséquences :**
- Crash complet du frontend avec des erreurs `Module not found` et `Export Skeleton doesn't exist`.
- Perte de toute la bibliothèque de composants UI (Shadcn), des utilitaires et de certains hooks.
- Disparition de l'AppHeader, des Sidebars et des styles.

**Statut & Résolution :**
- ✅ **Corrigé partiellement.** 55 composants standards ont été restaurés avec succès depuis le code source original du template (`free-nextjs-admin-dashboard-main.zip`).
- ✅ Les composants UI ont été recréés via `npx shadcn@latest`.
- ⚠️ **Action requise :** 24 pages spécifiques (créées manuellement par le développeur dans `app/[locale]/student`, `instructor`, etc.) n'étaient pas dans le zip. Elles ont reçu un code de secours temporaire (`"Cette page a ete recreee."`) pour permettre au projet de compiler. **Ces pages doivent impérativement être restaurées depuis l'historique des versions de OneDrive.**

---

## 2. 🔌 Problèmes d'Intégration (Backend)

### M-Pesa STK Push
**Description du problème :**
L'intégration de paiement M-Pesa dans `backend/apps/payments/mpesa.py` est en cours de développement. Les identifiants (Consumer Key, Secret) ont été fournis, mais le flux complet de callback (webhook) n'est pas encore totalement validé en production.

**Conséquences :**
- Risque d'échec des paiements si le serveur local (Django) ne peut pas recevoir les requêtes de l'API Safaricom via un tunnel public (ex: Ngrok).

**Statut & Résolution :**
- ⏳ En attente de test complet de bout-en-bout avec un webhook public fonctionnel.

---

## 3. 🌐 Configuration du Routage (i18n)

**Description du problème :**
La configuration de `next-intl` utilise `localePrefix: "never"` dans `routing.ts`, mais le `middleware.ts` tente de forcer manuellement des redirections basées sur l'URL en utilisant `pathname.split('/')[1]`. 

**Conséquences :**
- Incohérence possible dans la gestion des sessions linguistiques. Par exemple, une redirection vers `/login` pourrait échouer si l'URL ne contient pas explicitement le préfixe de langue.

**Statut & Résolution :**
- ⚠️ À surveiller. Si le changement de langue depuis le Dashboard ne fonctionne pas correctement, il faudra harmoniser le middleware avec la configuration `next-intl`.

---

## 4. 🧹 Qualité du Code & TypeScript

**Description du problème :**
Avant la corruption, de nombreuses erreurs TypeScript étaient présentes à cause de fichiers de bibliothèques externes placés directement dans le dossier `src` au lieu de `node_modules`, ce qui surchargeait le compilateur.

**Conséquences :**
- Lenteur extrême de la compilation.
- Risque de fuites de mémoire lors du `npm run build`.

**Statut & Résolution :**
- ✅ Le code a été nettoyé, et le dossier `src` ne contient plus de fichiers de dépendances lourdes mal placés. Le linter TypeScript passe désormais sans erreur sur les fichiers fonctionnels.
