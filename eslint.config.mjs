// @ts-check
import path from "path";
import { fileURLToPath } from "url";

import { fixupPluginRules, includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { flatConfigs as importPlugin } from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

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
      prettier,
    },
    extends: [importPlugin.recommended, importPlugin.typescript],
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
      "import/no-unresolved": "off",
      "import/default": "error",
      "import/no-named-as-default": "error",
      "import/no-self-import": "error",
      "import/order": [
        "error",
        {
          groups: [
            // Node.js builtins (with or without node: prefix)
            "builtin",
            // External packages (npm packages)
            "external",
            // Absolute imports and other imports
            "internal",
            // Relative parent imports (../)
            "parent",
            // Relative sibling imports (./)
            "sibling",
            // Index imports (./index)
            "index",
            // Object imports
            "object",
            // Type imports
            "type",
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "./setup",
              group: "sibling",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-named-as-default-member": "off",
      "import/no-useless-path-segments": "error",
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
);
