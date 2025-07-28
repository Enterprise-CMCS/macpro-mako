// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// @ts-check
import { fixupPluginRules, includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslintImportSort from "eslint-plugin-simple-import-sort";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath),
  // @ts-expect-error
  eslintConfigPrettier,
  {
    plugins: {
      react,
      // @ts-expect-error
      "react-hooks": fixupPluginRules(eslintReactHooks),
      "simple-import-sort": eslintImportSort,
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "simple-import-sort/imports": "error",
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@/no-else-return": ["error", { allowElseIf: false }],
      "@typescript-eslint/ban-ts-comment": [
        "off",
        {
          "ts-ignore": false,
          "ts-nocheck": false,
          "ts-check": true,
          "ts-expect-error": true,
        },
      ],
    },
  },
  storybook.configs["flat/recommended"]
);
