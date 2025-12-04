import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/main/__tests__/setup.ts"],
    include: ["src/main/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/main/**/*.ts"],
      exclude: ["src/main/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@contracts": path.resolve(__dirname, "./src/contracts"),
    },
  },
});
