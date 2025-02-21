import { defineConfig, loadEnv } from "vite";
//import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import checker from "vite-plugin-checker";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd());
  console.log({ env });

  return {
    optimizeDeps: {
      exclude: ["@aws-sdk/client-sts", "@smithy/shared-ini-file-loader"],
    },
    plugins: [
      react(),
      checker({ typescript: true }),
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
      root: ".",
      setupFiles: "./vitest.setup.ts",
      exclude: ["**/node_modules/**"],
      environment: "jsdom",
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    root: "./",
    publicDir: "src/assets",
    build: {
      outDir: "dist",
      minify: env.VITE_NODE_ENV === "production",
      rollupOptions: {
        treeshake: true,
      },
    },
    define: {
      __IS_FRONTEND__: "true",
    },
  };
});
