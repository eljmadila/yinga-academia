import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "garbage_backup/**",
    "src/app_temp/**",
    "*.js",
    // Vendored libraries in components
    "src/components/DndContext/**",
    "src/components/DragOverlay/**",
    "src/components/DndMonitor/**",
    "src/components/Accessibility/**",
    "src/components/HiddenText/**",
    "src/components/LiveRegion/**",
    "src/components/example/**",
    "src/components/Provider.tsx",
    "src/components/connect.tsx",
    "src/components/SortableContext.tsx",
    "src/components/Context.ts",
    // Vendored loose files and packages in src
    "src/*.js",
    "src/*.ts",
    "src/*.tsx",
    "!src/middleware.ts",
    "!src/utils.ts",

    "src/animation/**",
    "src/autotrackMemoize/**",
    "src/build/**",
    "src/client/**",
    "src/connect/**",
    "src/coordinates/**",
    "src/core/**",
    "src/curve/**",
    "src/devModeChecks/**",
    "src/easing/**",
    "src/event/**",
    "src/events/**",
    "src/execution-context/**",
    "src/experimental/**",
    "src/focus/**",
    "src/frameloop/**",
    "src/gestures/**",
    "src/icons/**",
    "src/layout/**",
    "src/logic/**",
    "src/messages/**",
    "src/modifiers/**",
    "src/motion/**",
    "src/offset/**",
    "src/order/**",
    "src/plugins/**",
    "src/projection/**",
    "src/render/**",
    "src/resize/**",
    "src/sensors/**",
    "src/server/**",
    "src/shared/**",
    "src/store/**",
    "src/strategies/**",
    "src/symbol/**",
    "src/type-guards/**",
    "src/types/**",
    "src/utilities/**",
    "src/utils/**",
    "src/value/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/ban-ts-comment": "off"
    }
  }
]);

export default eslintConfig;
