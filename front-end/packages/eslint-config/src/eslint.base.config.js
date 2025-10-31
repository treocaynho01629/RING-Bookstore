import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { eslintIgnore = [] } = require("../package.json");

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...js.configs.recommended,
  ...eslintConfigPrettier,
  { ignores: eslintIgnore },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    plugins: {
      turbo: turboPlugin,
      onlyWarn,
    },
    rules: {
      "no-undef": "error",
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "warn",
      "no-multi-spaces": "error",
      "no-trailing-spaces": "error",
      "no-redeclare": "error",
      "no-fallthrough": "error",
      "no-unreachable": "error",
      "max-len": "off",
      "no-multiple-empty-lines": "off",
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
];
