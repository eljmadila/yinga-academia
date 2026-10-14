const fs = require('fs');
let c = fs.readFileSync('src/app/[locale]/instructor/my-courses/page.tsx', 'utf8');

const emptyState = `{courses.length === 0 && !isLoading ? (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/20">
          <div className="mb-4 rounded-full bg-brand-100 p-4 dark:bg-brand-900/30">
            <Plus className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {t("noCourses")}
          </h2>
          <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Commencez à partager votre expertise avec le monde entier en créant votre tout premier cours sur la plateforme.
          </p>
          <a
            href={\`/\${locale}/instructor/create-course\`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t("createCourse")}
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">`;

c = c.replace(/<div className="overflow-x-auto">/, emptyState);
c = c.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/, '</div>\n        </div>\n      )}\n    </div>\n  );\n}');

fs.writeFileSync('src/app/[locale]/instructor/my-courses/page.tsx', c);
