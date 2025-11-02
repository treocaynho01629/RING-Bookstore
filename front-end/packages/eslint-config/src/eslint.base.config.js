import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { eslintIgnore = [] } = require("../package.json");

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  { ignores: eslintIgnore },
  {
    ignores: ["dist/**", "**/node_modules/**", "**/.next/**"],
  },
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
      onlyWarn,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
