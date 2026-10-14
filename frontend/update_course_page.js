const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/[locale]/student/courses/[courseId]/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  '"Chargement du cours..."': '{t("loading")}',
  '"Cours introuvable"': '{t("notFound")}',
  '"Bande annonce"': '{t("trailer")}',
  '"Votre formateur"': '{t("yourInstructor")}',
  "'Ajouter aux favoris'": "t('addToFavorites')",
  "'Retirer des favoris'": "t('removeFromFavorites')",
  '"Traitement..."': '{t("processing")}',
  "Les objectifs d'apprentissage n'ont pas encore été définis pour ce cours.": "{t('noObjectives')}",
  "Ce cours n'a pas encore de programme.": "{t('noSyllabus')}",
  "Aucun prérequis spécifique n'a été indiqué.": "{t('noRequirements')}",
  "Aucun avis pour le moment. Soyez le premier !": "{t('noReviews')}"
};

for (const [key, val] of Object.entries(replacements)) {
  content = content.replace(key, val);
}

// Special case for "Avis" in the tab
content = content.replace(/<h2[^>]*>Avis<\/h2>/, '<h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">{t("reviews")}</h2>');
content = content.replace(/<span className="text-gray-900 dark:text-white">Avis<\/span>/, '<span className="text-gray-900 dark:text-white">{t("reviews")}</span>');


fs.writeFileSync(file, content);
console.log("Updated courseId page.");
