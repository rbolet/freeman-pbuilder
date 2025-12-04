import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/main/db/schema/index.ts",
  out: "./src/main/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    // This is only used by drizzle-kit for generating migrations
    // Actual DB path is determined at runtime by Electron
    url: "./pbuilder.db",
  },
  verbose: true,
  strict: true,
});
