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
          {
            // feature branch, add-ga @ https://dobocggqhtrxb.cloudfront.net/
            id: "G-PTZMHTCC56",
            disable: env.VITE_NODE_ENV === "production",
          },
          {
            // master branch @ https://mako-dev.cms.gov/
            id: "G-CT1LJB6NL5",
            disable: env.VITE_NODE_ENV === "production",
          },
          {
            // val branch @ https://mako-val.cms.gov/
            id: "G-5K2N0LTR1B",
            disable: env.VITE_NODE_ENV === "production",
          },
          {
            // production branch @ https://mako.cms.gov/
            id: "G-58KK49TE7V",
            disable: env.VITE_NODE_ENV !== "production",
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
      coverage: {
        provider: "istanbul",
        reporter: "json",
      },
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
