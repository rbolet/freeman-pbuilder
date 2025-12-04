import { describe, it, expect, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import {
  initializeDatabase,
  closeDatabase,
  getDatabase,
  isDatabaseConnected,
} from "../db";
import { TEST_DATA_DIR, MIGRATIONS_PATH } from "./setup";

describe("Database Connection", () => {
  const testDbPath = path.join(TEST_DATA_DIR, "connection-test.db");

  afterEach(() => {
    // Close DB after each test
    closeDatabase();

    // Clean up test database file
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Clean up WAL files if they exist
    if (fs.existsSync(testDbPath + "-wal")) {
      fs.unlinkSync(testDbPath + "-wal");
    }
    if (fs.existsSync(testDbPath + "-shm")) {
      fs.unlinkSync(testDbPath + "-shm");
    }
  });

  it("should initialize database and create file", async () => {
    const db = await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    expect(db).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it("should return true for isDatabaseConnected after initialization", async () => {
    expect(isDatabaseConnected()).toBe(false);

    await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    expect(isDatabaseConnected()).toBe(true);
  });

  it("should return the same instance on subsequent calls", async () => {
    const db1 = await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    const db2 = await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    expect(db1).toBe(db2);
  });

  it("should close database connection", async () => {
    await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    expect(isDatabaseConnected()).toBe(true);

    closeDatabase();

    expect(isDatabaseConnected()).toBe(false);
  });

  it("should throw when getting database before initialization", () => {
    expect(() => getDatabase()).toThrow(
      "Database not initialized. Call initializeDatabase() first."
    );
  });

  it("should run migrations and enable WAL mode", async () => {
    const db = await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });

    // Check WAL mode is enabled
    const result = db.get<{ journal_mode: string }>(sql`PRAGMA journal_mode`);
    expect(result?.journal_mode).toBe("wal");
  });
});
