module.exports = {
  root: true,
  extends: [
    "custom",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "@typescript-eslint/no-empty-interface": "off",
    "react/react-in-jsx-scope": "off",
  },
};
