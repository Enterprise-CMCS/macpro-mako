// @ts-check
import react from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { fixupPluginRules } from "@eslint/compat";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react,
      // @ts-expect-error
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

    // @ts-expect-error
    rules: {
      "@typescript-eslint/no-empty-interface": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      ...eslintReactHooks.configs.recommended.rules,
    },
  },
);
