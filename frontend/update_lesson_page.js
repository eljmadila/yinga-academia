const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/[locale]/student/courses/[courseId]/lesson/[lessonId]/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<h2 className="mb-2 text-3xl font-extrabold text-white">Félicitations !<\/h2>/,
  '<h2 className="mb-2 text-3xl font-extrabold text-white">{t("congratulations")}</h2>'
);

content = content.replace(
  /Vous avez officiellement terminé <strong className="text-white">\{course\.title\}<\/strong> à 100%\. \s*Votre certificat est maintenant disponible !/,
  '{t("certAvailable").replace("{title}", course.title)}'
);

content = content.replace(
  /<p className="text-gray-400">Aucune vidéo disponible pour cette leçon<\/p>/,
  '<p className="text-gray-400">{t("noVideo")}</p>'
);

content = content.replace(
  /<span>🎓 Obtenir mon certificat<\/span>/g,
  '<span>🎓 {t("getCertificate")}</span>'
);

fs.writeFileSync(file, content);
console.log("Updated lessonId page.");
