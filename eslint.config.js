// ESLint flat config (ESLint 9+ reads only this file; the old `--ext` flag is gone).
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/", "storybook-static/", "node_modules/", "coverage/", "src/data/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["src/preset.ts", "scripts/**/*.js", "tests/**/*.ts", ".storybook/**/*.{ts,js,mjs,cjs}", "*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // zx scripts get `$`, `chalk`, `fs`, `path`, … as globals.
    files: ["scripts/prepublish-checks.js", "scripts/eject-typescript.js"],
    languageOptions: { globals: { $: "readonly", chalk: "readonly", fs: "readonly", path: "readonly", argv: "readonly" } },
  },
);
