const fs = require('fs');
const glob = require('fs').readdirSync; // Not exactly glob, let's just hardcode paths

const files = [
  'src/app/[locale]/student/courses/[courseId]/page.tsx',
  'src/app/[locale]/student/courses/[courseId]/lesson/[lessonId]/page.tsx',
  'src/app/[locale]/student/settings/page.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix "{t("key")}" to t("key")
  content = content.replace(/"\{t\("([^"]+)"\)\}"/g, 't("$1")');
  
  // Fix `{t("enrollNow")} ${course.price} €` which is inside ` ` template literal, but it was string literal.
  // Original was probably `Acheter pour ${course.price} €`.
  // Wait, in page.tsx line 232: course.price > 0 ? `{t("enrollNow")} ${course.price} €` : ...
  // `{t("enrollNow")} ...` is already in a backtick? Let's check line 232 above:
  // `{t("enrollNow")} ${course.price} €`
  // Actually, wait: course.price > 0 ? `{t("enrollNow")} ${course.price} €` : ...
  // It's a JSX string literal? No, it's a backtick string literal inside JS expression.
  // Ah, the problem is `{t("enrollNow")}` inside a backtick string literal becomes literal `{t("enrollNow")}` in JS. It needs to be `${t("enrollNow")}`.
  content = content.replace(/`\{t\("([^"]+)"\)\}/g, '`${t("$1")}');
  
  // Fix alt="{t("instructor")}" -> alt={t("instructor")}
  content = content.replace(/alt="\{t\("([^"]+)"\)\}"/g, 'alt={t("$1")}');
  
  // Fix || "{t("instructor")} passionné..."
  content = content.replace(/\|\| "\{t\("instructor"\)\} passionné(.*?)"/g, '|| `${t("instructor")} passionné$1`');
  
  // Fix title="{t("title")}" -> title={t("title")} just in case
  content = content.replace(/="\{t\("([^"]+)"\)\}"/g, '={t("$1")}');
  
  fs.writeFileSync(file, content, 'utf8');
});
