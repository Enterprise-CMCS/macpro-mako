import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginRadar({
      enableDev: true,
      analytics: {
        id: "G-ZJ1PHFW684",
        // disable: process.env.VITE_NODE_ENV !== "production",
      },
    }),
  ],
  server: {
    port: 5000,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./testing/setup.ts",
    coverage: {
      provider: "istanbul",
      reporter: "json",
    },
    exclude: ["**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: process.env.VITE_NODE_ENV === "production",
  },
});
