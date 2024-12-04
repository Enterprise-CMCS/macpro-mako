import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";
import { VitePluginRadar } from "vite-plugin-radar";

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), ""); // Added empty prefix parameter for better env loading

  return {
    optimizeDeps: {
      // Improved dependency optimization configuration
      exclude: ["@aws-sdk/client-sts", "@smithy/shared-ini-file-loader"],
      include: [], // Add frequently used dependencies here for pre-bundling
      esbuildOptions: {
        target: "esnext", // Optimize for modern browsers
      },
    },
    plugins: [
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
      // Add performance improvements for development
      hmr: {
        overlay: true,
      },
      // Add compression for better performance
      compress: true,
    },
    test: {
      environment: "jsdom",
      root: ".",
      setupFiles: "./testing/setup.ts",
      exclude: ["**/node_modules/**", "**/dist/**"], // Added dist folder to exclude
      coverage: {
        reporter: ["text", "json", "html"], // Added coverage reporting
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      // Add extensions for better module resolution
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    root: "./",
    publicDir: "src/assets",
    build: {
      outDir: "dist",
      minify: env.VITE_NODE_ENV === "production",
      rollupOptions: {
        treeshake: true,
        output: {
          // Optimize chunk splitting
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
          // Add chunk size optimization
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
      // Add source map for production debugging
      sourcemap: env.VITE_NODE_ENV !== "production",
      // Optimize CSS
      cssCodeSplit: true,
      // Add chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __IS_FRONTEND__: "true",
      // Add environment mode indicator
      __DEV__: mode === "development",
    },
    base: "./",
    // Add esbuild optimization
    esbuild: {
      target: "esnext",
      drop: env.VITE_NODE_ENV === "production" ? ["console", "debugger"] : [],
    },
  };
});
