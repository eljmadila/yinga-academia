const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/LessonQA.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace("import { MessageCircle", "import { useTranslations } from 'next-intl';\nimport { MessageCircle");

// Add hook
content = content.replace(
  "export default function LessonQA({ lessonId }: { lessonId: string }) {",
  "export default function LessonQA({ lessonId }: { lessonId: string }) {\n  const t = useTranslations('student.qa');"
);

// Replace strings
content = content.replace(
  /Questions & Réponses/,
  "{t('title')}"
);

content = content.replace(
  /Poser une nouvelle question/,
  "{t('askQuestion')}"
);

content = content.replace(
  /placeholder="Titre de votre question..."/,
  'placeholder={t("titlePlaceholder")}'
);

content = content.replace(
  /placeholder="Décrivez votre problème en détail..."/,
  'placeholder={t("bodyPlaceholder")}'
);

content = content.replace(
  /\{submitting \? 'Envoi\.\.\.' : 'Publier la question'\}/,
  '{submitting ? t("submitting") : t("submit")}'
);

content = content.replace(
  /<p className="text-gray-500 text-sm">Chargement\.\.\.<\/p>/,
  '<p className="text-gray-500 text-sm">{t("loading")}</p>'
);

content = content.replace(
  /<p className="text-gray-500 text-sm italic">Aucune question pour le moment\. Soyez le premier à en poser une !<\/p>/,
  '<p className="text-gray-500 text-sm italic">{t("empty")}</p>'
);

content = content.replace(
  /Résolu/g,
  "{t('resolved')}"
);

content = content.replace(
  /Formateur/g,
  "{t('instructor')}"
);

content = content.replace(
  /placeholder="Votre réponse..."/,
  'placeholder={t("replyPlaceholder")}'
);

content = content.replace(
  /Annuler/g,
  "{t('cancel')}"
);

content = content.replace(
  /Répondre/g,
  "{t('reply')}"
);

fs.writeFileSync(file, content);
console.log("Updated LessonQA component.");
