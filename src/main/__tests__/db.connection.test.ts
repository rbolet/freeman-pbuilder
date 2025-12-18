import { describe, it, expect, afterEach } from "vitest";
import path from "path";
import fs from "fs";
<<<<<<< Updated upstream
import { sql } from "drizzle-orm";
import {
  initializeDatabase,
  closeDatabase,
  getDatabase,
  isDatabaseConnected,
} from "../db";
import { TEST_DATA_DIR, MIGRATIONS_PATH } from "./setup";
=======
import { Sequelize } from "sequelize";
import { initializeDatabase, closeDatabase, isDatabaseConnected } from "../db/connection";
import { TEST_DATA_DIR } from "./setup";
>>>>>>> Stashed changes

describe("Database Connection", () => {
  const testDbPath = path.join(TEST_DATA_DIR, "connection-test.db");
  let db: Sequelize | null = null;

  afterEach(async () => {
    // Close DB after each test
    if (db) {
      await closeDatabase(db);
      db = null;
    }

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
    db = await initializeDatabase({
      dbPath: testDbPath,
    });

    expect(db).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it("should return true for isDatabaseConnected after initialization", async () => {
    const testDb = await initializeDatabase({
      dbPath: testDbPath,
    });
    db = testDb;

    expect(isDatabaseConnected(testDb)).toBe(true);
  });

  it("should return the same instance on subsequent calls", async () => {
    const db1 = await initializeDatabase({
      dbPath: testDbPath,
    });

    const db2 = await initializeDatabase({
      dbPath: testDbPath,
    });

    db = db1;

    expect(db1).toBe(db2);
  });

  it("should close database connection", async () => {
    const testDb = await initializeDatabase({
      dbPath: testDbPath,
    });

    expect(isDatabaseConnected(testDb)).toBe(true);

    await closeDatabase(testDb);

    expect(isDatabaseConnected(testDb)).toBe(false);
  });

  it("should run migrations and enable WAL mode", async () => {
    db = await initializeDatabase({
      dbPath: testDbPath,
    });

    // Check WAL mode is enabled
    const [results] = await db.query("PRAGMA journal_mode");
    const result = results[0] as { journal_mode: string };
    expect(result?.journal_mode).toBe("wal");
  });
});
