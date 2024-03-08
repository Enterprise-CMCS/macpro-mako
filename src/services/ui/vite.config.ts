import { defineConfig, loadEnv } from "vite";
//import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      VitePluginRadar({
        enableDev: true,
        analytics: [
          {
            id: env.VITE_GOOGLE_ANALYTICS_GTAG,
            disable: env.VITE_GOOGLE_ANALYTICS_DISABLE === "true",
          },
        ],
      }),
    ],
    server: {
      port: 5000,
    },
    test: {
      environment: "jsdom",
      setupFiles: "./testing/setup.ts",
      exclude: ["**/e2e/**", "**/node_modules/**"],
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      minify: env.VITE_NODE_ENV === "production",
    },
  };
});
