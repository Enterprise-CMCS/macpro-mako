/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", " ./node_modules/flowbite-react/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Open Sans'", "sans-serif"],
      },
      colors: {
        primary: "#0071bc",
        accent: "#205493",
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
