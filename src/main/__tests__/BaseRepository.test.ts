import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import BetterSqlite3, { Database } from "better-sqlite3";
import { BaseRepository } from "../repositories/BaseRepository";
import {
  stubTable,
  createStubRecord,
  StubRecord,
  createMockSetup,
  createMockRecord,
} from "./utils";

describe("BaseRepository", () => {
  let sqlite: Database;
  let db: BetterSQLite3Database;
  let repo: BaseRepository<typeof stubTable>;

  beforeEach(() => {
    // Create in-memory database
    sqlite = new BetterSqlite3(":memory:");

    // Create the stub table
    sqlite.exec(`
      CREATE TABLE stub_table (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      )
    `);

    db = drizzle(sqlite);
    repo = new BaseRepository(db, stubTable);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("findAll", () => {
    it("should return empty array when no records exist", () => {
      const results = repo.findAll();
      expect(results).toEqual([]);
    });

    it("should return all records", () => {
      const record1 = createStubRecord({ id: "id-1", name: "First" });
      const record2 = createStubRecord({ id: "id-2", name: "Second" });

      db.insert(stubTable).values(record1).run();
      db.insert(stubTable).values(record2).run();

      const results = repo.findAll();
      expect(results).toHaveLength(2);
      expect(results).toContainEqual(record1);
      expect(results).toContainEqual(record2);
    });
  });

  describe("findById", () => {
    it("should return undefined when record does not exist", () => {
      const result = repo.findById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return the record when it exists", () => {
      const record = createStubRecord({ id: "test-id", name: "Test" });
      db.insert(stubTable).values(record).run();

      const result = repo.findById("test-id");
      expect(result).toEqual(record);
    });

    it("should throw error if more than one record found", () => {
      // Use mock db to bypass PK constraint and simulate duplicate IDs
      const { db: mockDb, table: mockTable } = createMockSetup();

      // Configure mock to return two records with the same ID
      const duplicateId = "duplicate-id";
      mockDb.setResults([
        createMockRecord({ id: duplicateId, name: "First" }),
        createMockRecord({ id: duplicateId, name: "Second" }),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRepo = new BaseRepository(mockDb as any, mockTable as any);

      expect(() => mockRepo.findById(duplicateId)).toThrow(
        `Expected 0 or 1 record for id "${duplicateId}", but found 2`
      );
    });
  });

  describe("findWhere", () => {
    beforeEach(() => {
      const records = [
        createStubRecord({ id: "1", name: "Alice", status: "active" }),
        createStubRecord({ id: "2", name: "Bob", status: "active" }),
        createStubRecord({ id: "3", name: "Charlie", status: "inactive" }),
      ];

      for (const record of records) {
        db.insert(stubTable).values(record).run();
      }
    });

    it("should return all records when conditions is empty", () => {
      const results = repo.findWhere({});
      expect(results).toHaveLength(3);
    });

    it("should filter by single condition", () => {
      const results = repo.findWhere({ status: "active" });
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.status === "active")).toBe(true);
    });

    it("should filter by multiple conditions (AND)", () => {
      const results = repo.findWhere({ status: "active", name: "Alice" });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Alice");
    });

    it("should return empty array when no records match", () => {
      const results = repo.findWhere({ status: "deleted" });
      expect(results).toEqual([]);
    });
  });

  describe("transform", () => {
    it("should return record as-is by default", () => {
      const record = createStubRecord();
      db.insert(stubTable).values(record).run();

      const result = repo.findById(record.id);
      expect(result).toEqual(record);
    });

    it("should apply transform to findAll results", () => {
      // Create a custom repository with transform
      class TransformingRepo extends BaseRepository<
        typeof stubTable,
        { id: string; displayName: string }
      > {
        protected transform(record: StubRecord) {
          return {
            id: record.id,
            displayName: record.name.toUpperCase(),
          };
        }
      }

      const customRepo = new TransformingRepo(db, stubTable);
      const record = createStubRecord({ id: "t1", name: "test" });
      db.insert(stubTable).values(record).run();

      const results = customRepo.findAll();
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: "t1", displayName: "TEST" });
    });

    it("should apply transform to findById result", () => {
      class TransformingRepo extends BaseRepository<
        typeof stubTable,
        { id: string; displayName: string }
      > {
        protected transform(record: StubRecord) {
          return {
            id: record.id,
            displayName: record.name.toUpperCase(),
          };
        }
      }

      const customRepo = new TransformingRepo(db, stubTable);
      const record = createStubRecord({ id: "t2", name: "hello" });
      db.insert(stubTable).values(record).run();

      const result = customRepo.findById("t2");
      expect(result).toEqual({ id: "t2", displayName: "HELLO" });
    });

    it("should apply transform to findWhere results", () => {
      class TransformingRepo extends BaseRepository<
        typeof stubTable,
        { id: string; displayName: string }
      > {
        protected transform(record: StubRecord) {
          return {
            id: record.id,
            displayName: record.name.toUpperCase(),
          };
        }
      }

      const customRepo = new TransformingRepo(db, stubTable);
      db.insert(stubTable)
        .values(createStubRecord({ id: "t3", name: "world", status: "active" }))
        .run();

      const results = customRepo.findWhere({ status: "active" });
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({ id: "t3", displayName: "WORLD" });
    });
  });
});
