import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import { initializeDatabase, closeDatabase, getDatabase } from "../db";
import { TEST_DATA_DIR, MIGRATIONS_PATH } from "./setup";

interface TableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface TableListItem {
  name: string;
}

describe("Database Schema", () => {
  const testDbPath = path.join(TEST_DATA_DIR, "schema-test.db");

  beforeAll(async () => {
    // Ensure test directory exists and clean up any previous test db
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Remove WAL files if they exist
    const walPath = `${testDbPath}-wal`;
    const shmPath = `${testDbPath}-shm`;
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    // Initialize database for all schema tests
    await initializeDatabase({
      dbPath: testDbPath,
      migrationsPath: MIGRATIONS_PATH,
    });
  });

  afterEach(() => {
    // Don't close database between tests - we need it for all schema tests
  });

  // Clean up after all tests
  afterAll(() => {
    closeDatabase();
    // Clean up test database files
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    const walPath = `${testDbPath}-wal`;
    const shmPath = `${testDbPath}-shm`;
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  describe("proposals table", () => {
    it("should exist in the database", () => {
      const db = getDatabase();
      const tables = db.all<TableListItem>(
        sql`SELECT name FROM sqlite_master WHERE type='table' AND name='proposals'`
      );
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe("proposals");
    });

    it("should have id column as TEXT primary key", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const idColumn = columns.find((col) => col.name === "id");

      expect(idColumn).toBeDefined();
      expect(idColumn?.type.toUpperCase()).toBe("TEXT");
      expect(idColumn?.pk).toBe(1);
      expect(idColumn?.notnull).toBe(1);
    });

    it("should have name column as TEXT NOT NULL", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const nameColumn = columns.find((col) => col.name === "name");

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.type.toUpperCase()).toBe("TEXT");
      expect(nameColumn?.notnull).toBe(1);
    });

    it("should have createdAt column as TEXT NOT NULL", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const createdAtColumn = columns.find((col) => col.name === "created_at");

      expect(createdAtColumn).toBeDefined();
      expect(createdAtColumn?.type.toUpperCase()).toBe("TEXT");
      expect(createdAtColumn?.notnull).toBe(1);
    });

    it("should have updatedAt column as TEXT NOT NULL", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const updatedAtColumn = columns.find((col) => col.name === "updated_at");

      expect(updatedAtColumn).toBeDefined();
      expect(updatedAtColumn?.type.toUpperCase()).toBe("TEXT");
      expect(updatedAtColumn?.notnull).toBe(1);
    });

    it("should have deletedAt column as nullable TEXT for soft delete", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const deletedAtColumn = columns.find((col) => col.name === "deleted_at");

      expect(deletedAtColumn).toBeDefined();
      expect(deletedAtColumn?.type.toUpperCase()).toBe("TEXT");
      expect(deletedAtColumn?.notnull).toBe(0); // nullable for soft delete
    });

    it("should have all expected columns", () => {
      const db = getDatabase();
      const columns = db.all<TableInfo>(sql`PRAGMA table_info(proposals)`);
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
      expect(columnNames).toContain("deleted_at");
      expect(columnNames).toHaveLength(5);
    });
  });
});
