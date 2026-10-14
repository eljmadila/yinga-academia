const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/[locale]/instructor/qa/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const t = useTranslations('sidebar');", "const t = useTranslations('instructor.qa');");

const replacements = {
  "Questions des étudiants": "{t('title')}",
  "Gérez les questions posées par les étudiants sur vos cours.": "{t('subtitle')}",
  "Aucune question": "{t('emptyTitle')}",
  "Vos étudiants n'ont pas encore posé de questions sur vos cours.": "{t('emptySubtitle')}",
  "Leçon: ": "{t('lesson')}: ",
  "Marquer résolu": "{t('markResolved')}",
  "Résolu": "{t('resolved')}",
  "Vous": "{t('you')}",
  'placeholder="Écrivez votre réponse..."': 'placeholder={t("replyPlaceholder")}',
  ">Annuler<": ">{t('cancel')}<",
  ">Envoyer<": ">{t('send')}<",
  "Répondre à l'étudiant": "{t('replyToStudent')}",
  "Chargement des questions...": "{t('loading')}"
};

for (const [key, val] of Object.entries(replacements)) {
  content = content.replace(new RegExp(key, 'g'), val);
}

fs.writeFileSync(file, content);
console.log("Updated instructor qa page.");
