// @ts-check
import react from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { fixupPluginRules, includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/8522
  includeIgnoreFile(gitignorePath),
  {
    plugins: {
      react,
      // @ts-expect-error https://github.com/facebook/react/pull/28773#issuecomment-2147149016
      "react-hooks": fixupPluginRules(eslintReactHooks),
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
      "@typescript-eslint/no-empty-interface": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
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
);
