import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/renderer/__tests__/setup.ts"],
    include: ["src/renderer/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/renderer/**/*.{ts,tsx}"],
      exclude: ["src/renderer/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer"),
      "@components": path.resolve(__dirname, "./src/renderer/components"),
      "@hooks": path.resolve(__dirname, "./src/renderer/hooks"),
    },
  },
});
