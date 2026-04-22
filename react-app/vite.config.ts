//import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd());
  console.log({ env });
  const plugins = [
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
  ];

  if (mode !== "test") {
    const { checker } = await import("vite-plugin-checker");
    plugins.splice(1, 0, checker({ typescript: true }));
  }

  return {
    optimizeDeps: {
      exclude: ["@aws-sdk/client-sts", "@smithy/shared-ini-file-loader"],
    },
    plugins,
    server: {
      port: 5000,
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
