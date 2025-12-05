import { defineConfig } from "vite";
import { builtinModules } from "module";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Externalize all Node.js built-in modules
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        // Externalize native modules - they'll be resolved from node_modules at runtime
        "better-sqlite3",
      ],
    },
  },
  resolve: {
    // Ensure we're building for Node.js
    mainFields: ["module", "main"],
  },
});
