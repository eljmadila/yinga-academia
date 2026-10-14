const fs = require('fs');

const files = [
  'src/app/[locale]/student/catalog/page.tsx',
  'src/app/[locale]/student/dashboard/page.tsx',
  'src/app/[locale]/student/courses/page.tsx',
  'src/app/[locale]/student/courses/[courseId]/page.tsx'
];

const DEFAULT_IMG = '"https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80"';

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace random fallbacks with the DEFAULT_IMG
  content = content.replace(/"https:\/\/images\.unsplash\.com\/photo-[^"]+"/g, DEFAULT_IMG);
  
  fs.writeFileSync(file, content, 'utf8');
});
