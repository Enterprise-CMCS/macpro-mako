import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
  build: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    minify: import.meta.env.VITE_NODE_ENV === "production",
    // minify: false,
  },
});
