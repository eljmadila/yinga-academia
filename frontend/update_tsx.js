const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements, hookText) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if needed
  if (!content.includes('import { useTranslations }')) {
    content = content.replace(/(import React[^;]+;)/, '$1\nimport { useTranslations } from "next-intl";');
  }

  // Add the translation hook inside the component
  const hookDecl = `const t = useTranslations("${hookText}");`;
  if (!content.includes(hookDecl)) {
    content = content.replace(/(export default function [a-zA-Z0-9]+\(\)[^{]*{)/, `$1\n  ${hookDecl}`);
  }

  replacements.forEach(([pattern, replacement]) => {
    // If it's a string replace
    if (typeof pattern === 'string') {
      content = content.split(pattern).join(replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Course Details Page
const coursePath = 'src/app/[locale]/student/courses/[courseId]/page.tsx';
replaceInFile(coursePath, [
  ["Retour au catalogue", '{t("backToCatalog")}'],
  [">étudiants<", '>{t("enrollments")}<'],
  ["Niveau", '{t("level")}'],
  ["Dernière mise à jour :", '{t("lastUpdated")} :'],
  ["Ce cours inclut :", '{t("includes")} :'],
  ["Ce que vous allez apprendre", '{t("objectives")}'],
  ["Programme du cours", '{t("syllabus")}'],
  ["Prérequis", '{t("requirements")}'],
  ["modules •", '{t("modules")} •'],
  ["leçons", '{t("lessons")}'],
  ["Description", '{t("description")}'],
  ["Formateur", '{t("instructor")}'],
  ["Acheter pour", '{t("enrollNow")}'],
  ["S'inscrire gratuitement", '{t("freeEnroll")}'],
  ["Continuer le cours", '{t("continueCourse")}'],
  ["Chargement...", '{t("loading")}'],
], "student.course");

// 2. Classroom Page
const classroomPath = 'src/app/[locale]/student/courses/[courseId]/lesson/[lessonId]/page.tsx';
replaceInFile(classroomPath, [
  ["Retour au cours", '{t("back")}'],
  ["Leçon suivante", '{t("next")}'],
  ["Leçon précédente", '{t("prev")}'],
  ["Marquer comme terminé", '{t("markComplete")}'],
  [">Terminé<", '>{t("completed")}<'],
  ["Télécharger mon certificat", '{t("downloadCert")}'],
  ["Qu'avez-vous pensé de ce cours ?", '{t("ratingTitle")}'],
  ["Laissez un petit commentaire (optionnel)...", '{t("ratingPlaceholder")}'],
  ["Envoyer mon avis", '{t("submitRating")}'],
  [">Envoi...<", '>{t("submitting")}<'],
  ["Merci pour votre retour !", '{t("thankYou")}'],
  [">Fermer<", '>{t("close")}<'],
  ["Le formateur prépare le contenu !", '{t("emptyText")}'],
  ["Chargement de la salle de classe...", '{t("loading")}'],
], "student.classroom");

// 3. My Courses Page
const myCoursesPath = 'src/app/[locale]/student/courses/page.tsx';
replaceInFile(myCoursesPath, [
  ["Mes Apprentissages", '{t("title")}'],
  ["Reprenez là où vous vous êtes arrêté.", '{t("subtitle")}'],
  ["Progression", '{t("progress")}'],
  ["Reprendre", '{t("resume")}'],
], "student.myCourses");

// 4. Settings Page
const settingsPath = 'src/app/[locale]/student/settings/page.tsx';
replaceInFile(settingsPath, [
  ["Mon Profil", '{t("title")}'],
  ["Gérez vos informations personnelles et votre avatar.", '{t("subtitle")}'],
  ["Photo de profil", '{t("avatar")}'],
  ["Recommandé : image carrée d'au moins 300x300px.", '{t("avatarHint")}'],
  ["Changer d'image", '{t("changeAvatar")}'],
  [">Prénom<", '>{t("firstName")}<'],
  [">Nom<", '>{t("lastName")}<'],
  ["Adresse Email (Lecture seule)", '{t("email")}'],
  ["Bio / Description", '{t("bio")}'],
  ["Parlez-nous un peu de vous...", '{t("bioPlaceholder")}'],
  ["Enregistrer les modifications", '{t("save")}'],
  [">Enregistrement...<", '>{t("saving")}<'],
], "student.settings");
