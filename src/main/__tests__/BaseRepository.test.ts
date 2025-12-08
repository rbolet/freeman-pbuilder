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
      // Transform excludes timestamps by default
      expect(results).toContainEqual({ id: "id-1", name: "First", status: null });
      expect(results).toContainEqual({ id: "id-2", name: "Second", status: null });
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
      // Transform excludes timestamps by default
      expect(result).toEqual({ id: "test-id", name: "Test", status: null });
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
    it("should return record without timestamps by default", () => {
      const record = createStubRecord();
      db.insert(stubTable).values(record).run();

      const result = repo.findById(record.id);
      // Default transform excludes timestamps
      expect(result).toEqual({
        id: record.id,
        name: record.name,
        status: record.status,
      });
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

  describe("updateById", () => {
    it("should update a single record and return its ID", () => {
      const record = createStubRecord({ id: "update-1", name: "Original" });
      db.insert(stubTable).values(record).run();

      const updatedIds = repo.updateById("update-1", { name: "Updated" });

      expect(updatedIds).toEqual(["update-1"]);

      // Verify the record was actually updated
      const updated = repo.findById("update-1");
      expect(updated?.name).toBe("Updated");
    });

    it("should update multiple records and return their IDs", () => {
      const record1 = createStubRecord({ id: "multi-1", status: "pending" });
      const record2 = createStubRecord({ id: "multi-2", status: "pending" });
      db.insert(stubTable).values(record1).run();
      db.insert(stubTable).values(record2).run();

      const updatedIds = repo.updateById(["multi-1", "multi-2"], {
        status: "active",
      });

      expect(updatedIds).toHaveLength(2);
      expect(updatedIds).toContain("multi-1");
      expect(updatedIds).toContain("multi-2");

      // Verify both records were updated
      const updated1 = repo.findById("multi-1");
      const updated2 = repo.findById("multi-2");
      expect(updated1?.status).toBe("active");
      expect(updated2?.status).toBe("active");
    });

    it("should throw error when given empty array of IDs", () => {
      expect(() => repo.updateById([], { name: "Ignored" })).toThrow("No IDs provided for update");
    });

    it("should throw error when single ID is not found", () => {
      expect(() => repo.updateById("nonexistent", { name: "Test" })).toThrow(
        'Records not found for IDs: "nonexistent"'
      );
    });

    it("should throw error when any ID in array is not found", () => {
      const record = createStubRecord({ id: "exists-1" });
      db.insert(stubTable).values(record).run();

      expect(() =>
        repo.updateById(["exists-1", "missing-1", "missing-2"], {
          name: "Test",
        })
      ).toThrow('Records not found for IDs: "missing-1", "missing-2"');
    });

    it("should throw error listing all missing IDs (using mock)", () => {
      // Use mock to control exactly which IDs are "updated"
      const { db: mockDb, table: mockTable } = createMockSetup();

      // Simulate only id-1 being found/updated
      mockDb.setUpdateResults([{ id: "id-1" }]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRepo = new BaseRepository(mockDb as any, mockTable as any);

      expect(() => mockRepo.updateById(["id-1", "id-2", "id-3"], { name: "Test" })).toThrow(
        'Records not found for IDs: "id-2", "id-3"'
      );
    });
  });

  describe("transform options", () => {
    beforeEach(() => {
      const record = createStubRecord({ id: "t-1", name: "Test", status: "active" });
      db.insert(stubTable).values(record).run();
    });

    it("should exclude audit timestamps by default", () => {
      const result = repo.findById("t-1");
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
      expect(result).not.toHaveProperty("deletedAt");
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
    });

    it("should include audit timestamps when includeTimestamps is true", () => {
      // Create a custom repo that passes includeTimestamps
      class TimestampRepo extends BaseRepository<typeof stubTable> {
        findByIdWithTimestamps(id: string) {
          const results = this.db.select().from(this.table).all();
          const record = results.find((r) => r.id === id);
          return record ? this.transform(record, { includeTimestamps: true }) : undefined;
        }
      }

      const customRepo = new TimestampRepo(db, stubTable);
      const result = customRepo.findByIdWithTimestamps("t-1");

      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
      expect(result).toHaveProperty("deletedAt");
    });

    it("should exclude additional keys when exclude is provided", () => {
      class ExcludeRepo extends BaseRepository<typeof stubTable> {
        findByIdWithExcludes(id: string) {
          const results = this.db.select().from(this.table).all();
          const record = results.find((r) => r.id === id);
          return record ? this.transform(record, { exclude: ["status"] }) : undefined;
        }
      }

      const customRepo = new ExcludeRepo(db, stubTable);
      const result = customRepo.findByIdWithExcludes("t-1");

      expect(result).not.toHaveProperty("status");
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
    });

    it("should return only included keys when include is provided", () => {
      class IncludeRepo extends BaseRepository<typeof stubTable> {
        findByIdWithIncludes(id: string) {
          const results = this.db.select().from(this.table).all();
          const record = results.find((r) => r.id === id);
          return record ? this.transform(record, { include: ["id", "name"] }) : undefined;
        }
      }

      const customRepo = new IncludeRepo(db, stubTable);
      const result = customRepo.findByIdWithIncludes("t-1");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).not.toHaveProperty("status");
      expect(result).not.toHaveProperty("createdAt");
    });

    it("should ignore exclude when include is provided", () => {
      class IncludeOverExcludeRepo extends BaseRepository<typeof stubTable> {
        findByIdWithBoth(id: string) {
          const results = this.db.select().from(this.table).all();
          const record = results.find((r) => r.id === id);
          return record
            ? this.transform(record, { include: ["id", "name", "status"], exclude: ["name"] })
            : undefined;
        }
      }

      const customRepo = new IncludeOverExcludeRepo(db, stubTable);
      const result = customRepo.findByIdWithBoth("t-1");

      // include takes precedence, so name should be present despite being in exclude
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("status");
      expect(result).not.toHaveProperty("createdAt");
    });
  });

  describe("insert", () => {
    it("should insert a single record and return its ID", () => {
      const insertedIds = repo.insert({ name: "New Record" });

      expect(insertedIds).toHaveLength(1);
      expect(insertedIds[0]).toBeDefined();

      // Verify the record was inserted
      const found = repo.findById(insertedIds[0]);
      expect(found).toBeDefined();
      expect((found as StubRecord).name).toBe("New Record");
    });

    it("should insert multiple records when qty is provided", () => {
      const insertedIds = repo.insert({ name: "Bulk Record" }, { qty: 3 });

      expect(insertedIds).toHaveLength(3);

      // Verify all records were inserted
      for (const id of insertedIds) {
        const found = repo.findById(id);
        expect(found).toBeDefined();
        expect((found as StubRecord).name).toBe("Bulk Record");
      }
    });

    it("should use provided IDs when ids option is given", () => {
      const providedIds = [crypto.randomUUID(), crypto.randomUUID()];
      const insertedIds = repo.insert({ name: "With ID" }, { qty: 2, ids: providedIds });

      expect(insertedIds).toEqual(providedIds);

      // Verify records have the correct IDs
      for (const id of providedIds) {
        const found = repo.findById(id);
        expect(found).toBeDefined();
      }
    });

    it("should throw error when qty does not match ids length", () => {
      const providedIds = [crypto.randomUUID()];

      expect(() => repo.insert({ name: "Mismatch" }, { qty: 3, ids: providedIds })).toThrow(
        "IDs array length (1) must match qty (3)"
      );
    });

    it("should throw error when provided IDs are not valid UUIDs", () => {
      expect(() =>
        repo.insert({ name: "Invalid" }, { qty: 2, ids: ["not-a-uuid", "also-not-valid"] })
      ).toThrow('Invalid UUIDs for ids: "not-a-uuid", "also-not-valid"');
    });

    it("should throw error when returned IDs do not match provided IDs (using mock)", () => {
      const { db: mockDb, table: mockTable } = createMockSetup();

      // Configure mock to return different IDs than provided
      const providedIds = [crypto.randomUUID(), crypto.randomUUID()];
      const returnedIds = [crypto.randomUUID()]; // Only one, different from provided
      mockDb.setInsertResults(returnedIds.map((id) => ({ id })));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRepo = new BaseRepository(mockDb as any, mockTable as any);

      expect(() => mockRepo.insert({ name: "Test" }, { qty: 2, ids: providedIds })).toThrow(
        /Inserted IDs do not match provided IDs/
      );
    });

    it("should auto-generate timestamps on insert", () => {
      const beforeInsert = new Date().toISOString();
      const insertedIds = repo.insert({ name: "Timestamped" });
      const afterInsert = new Date().toISOString();

      // Get raw record with timestamps using direct query
      const rawRecord = db
        .select()
        .from(stubTable)
        .all()
        .find((r) => r.id === insertedIds[0]);

      expect(rawRecord).toBeDefined();
      expect(rawRecord!.createdAt).toBeDefined();
      expect(rawRecord!.updatedAt).toBeDefined();
      expect(rawRecord!.createdAt >= beforeInsert).toBe(true);
      expect(rawRecord!.createdAt <= afterInsert).toBe(true);
    });
  });

  describe("soft delete", () => {
    describe("deleteById", () => {
      it("should soft delete a single record", () => {
        const record = createStubRecord({ id: "delete-1", name: "ToDelete" });
        db.insert(stubTable).values(record).run();

        const result = repo.deleteById("delete-1");
        expect(result).toEqual(["delete-1"]);

        // Record should not appear in findAll (soft deleted)
        expect(repo.findAll()).toHaveLength(0);

        // Record should appear with includeDeleted
        const allRecords = repo.findAll({ includeDeleted: true });
        expect(allRecords).toHaveLength(1);
      });

      it("should soft delete multiple records", () => {
        const records = [
          createStubRecord({ id: "delete-1", name: "First" }),
          createStubRecord({ id: "delete-2", name: "Second" }),
          createStubRecord({ id: "keep-1", name: "Keep" }),
        ];
        records.forEach((r) => db.insert(stubTable).values(r).run());

        const result = repo.deleteById(["delete-1", "delete-2"]);
        expect(result).toEqual(["delete-1", "delete-2"]);

        // Only non-deleted record should appear
        const remaining = repo.findAll();
        expect(remaining).toHaveLength(1);
        expect(remaining[0]).toMatchObject({ id: "keep-1" });
      });

      it("should throw error when ID not found", () => {
        expect(() => repo.deleteById("nonexistent")).toThrow(
          'Records not found for IDs: "nonexistent"'
        );
      });

      it("should throw error when any ID not found in array", () => {
        const record = createStubRecord({ id: "exists", name: "Exists" });
        db.insert(stubTable).values(record).run();

        expect(() => repo.deleteById(["exists", "missing"])).toThrow(
          'Records not found for IDs: "missing"'
        );
      });

      it("should throw error when empty array provided", () => {
        expect(() => repo.deleteById([])).toThrow("No IDs provided for delete");
      });

      it("should be idempotent - deleting already deleted record succeeds", () => {
        const record = createStubRecord({ id: "delete-twice", name: "DeleteTwice" });
        db.insert(stubTable).values(record).run();

        // Delete first time
        repo.deleteById("delete-twice");

        // Delete second time - should not throw
        const result = repo.deleteById("delete-twice");
        expect(result).toEqual(["delete-twice"]);
      });

      it("should set deletedAt timestamp", () => {
        const record = createStubRecord({ id: "check-timestamp", name: "CheckTimestamp" });
        db.insert(stubTable).values(record).run();

        const beforeDelete = new Date().toISOString();
        repo.deleteById("check-timestamp");
        const afterDelete = new Date().toISOString();

        const rawRecord = db
          .select()
          .from(stubTable)
          .all()
          .find((r) => r.id === "check-timestamp");

        expect(rawRecord!.deletedAt).not.toBeNull();
        expect(rawRecord!.deletedAt! >= beforeDelete).toBe(true);
        expect(rawRecord!.deletedAt! <= afterDelete).toBe(true);
      });
    });

    describe("restoreById", () => {
      it("should restore a soft-deleted record", () => {
        const record = createStubRecord({ id: "restore-1", name: "ToRestore" });
        db.insert(stubTable).values(record).run();

        // Delete then restore
        repo.deleteById("restore-1");
        expect(repo.findAll()).toHaveLength(0);

        const result = repo.restoreById("restore-1");
        expect(result).toEqual(["restore-1"]);

        // Record should appear in findAll again
        expect(repo.findAll()).toHaveLength(1);
      });

      it("should restore multiple records", () => {
        const records = [
          createStubRecord({ id: "restore-1", name: "First" }),
          createStubRecord({ id: "restore-2", name: "Second" }),
        ];
        records.forEach((r) => db.insert(stubTable).values(r).run());

        // Delete all
        repo.deleteById(["restore-1", "restore-2"]);
        expect(repo.findAll()).toHaveLength(0);

        // Restore all
        const result = repo.restoreById(["restore-1", "restore-2"]);
        expect(result).toEqual(["restore-1", "restore-2"]);
        expect(repo.findAll()).toHaveLength(2);
      });

      it("should throw error when ID not found", () => {
        expect(() => repo.restoreById("nonexistent")).toThrow(
          'Records not found for IDs: "nonexistent"'
        );
      });

      it("should throw error when empty array provided", () => {
        expect(() => repo.restoreById([])).toThrow("No IDs provided for restore");
      });

      it("should be idempotent - restoring non-deleted record succeeds", () => {
        const record = createStubRecord({ id: "restore-twice", name: "RestoreTwice" });
        db.insert(stubTable).values(record).run();

        // Restore without deleting first - should not throw
        const result = repo.restoreById("restore-twice");
        expect(result).toEqual(["restore-twice"]);
      });

      it("should set deletedAt to null", () => {
        const record = createStubRecord({ id: "check-null", name: "CheckNull" });
        db.insert(stubTable).values(record).run();

        repo.deleteById("check-null");
        repo.restoreById("check-null");

        const rawRecord = db
          .select()
          .from(stubTable)
          .all()
          .find((r) => r.id === "check-null");

        expect(rawRecord!.deletedAt).toBeNull();
      });
    });

    describe("emptyTrashById", () => {
      it("should permanently delete a single record", () => {
        const record = createStubRecord({ id: "hard-delete-1", name: "HardDelete" });
        db.insert(stubTable).values(record).run();

        const result = repo.emptyTrashById("hard-delete-1");
        expect(result).toEqual(["hard-delete-1"]);

        // Record should not exist at all
        const allRecords = db.select().from(stubTable).all();
        expect(allRecords).toHaveLength(0);
      });

      it("should permanently delete multiple records", () => {
        const records = [
          createStubRecord({ id: "hard-1", name: "First" }),
          createStubRecord({ id: "hard-2", name: "Second" }),
          createStubRecord({ id: "keep", name: "Keep" }),
        ];
        records.forEach((r) => db.insert(stubTable).values(r).run());

        const result = repo.emptyTrashById(["hard-1", "hard-2"]);
        expect(result).toEqual(["hard-1", "hard-2"]);

        const allRecords = db.select().from(stubTable).all();
        expect(allRecords).toHaveLength(1);
        expect(allRecords[0].id).toBe("keep");
      });

      it("should throw error when ID not found", () => {
        expect(() => repo.emptyTrashById("nonexistent")).toThrow(
          'Records not found for IDs: "nonexistent"'
        );
      });

      it("should throw error when empty array provided", () => {
        expect(() => repo.emptyTrashById([])).toThrow("No IDs provided for permanent delete");
      });

      it("should work on soft-deleted records", () => {
        const record = createStubRecord({ id: "soft-then-hard", name: "SoftThenHard" });
        db.insert(stubTable).values(record).run();

        // Soft delete first
        repo.deleteById("soft-then-hard");

        // Then hard delete
        const result = repo.emptyTrashById("soft-then-hard");
        expect(result).toEqual(["soft-then-hard"]);

        // Should be completely gone
        const allRecords = db.select().from(stubTable).all();
        expect(allRecords).toHaveLength(0);
      });
    });

    describe("find methods with includeDeleted", () => {
      beforeEach(() => {
        const records = [
          createStubRecord({ id: "active-1", name: "Active1", status: "active" }),
          createStubRecord({ id: "active-2", name: "Active2", status: "active" }),
          createStubRecord({ id: "deleted-1", name: "Deleted1", status: "active" }),
          createStubRecord({ id: "deleted-2", name: "Deleted2", status: "active" }),
        ];
        records.forEach((r) => db.insert(stubTable).values(r).run());

        // Soft delete some records
        repo.deleteById(["deleted-1", "deleted-2"]);
      });

      it("findAll should exclude deleted records by default", () => {
        const results = repo.findAll();
        expect(results).toHaveLength(2);
        expect(results.map((r) => (r as { id: string }).id).sort()).toEqual([
          "active-1",
          "active-2",
        ]);
      });

      it("findAll should include deleted records when includeDeleted is true", () => {
        const results = repo.findAll({ includeDeleted: true });
        expect(results).toHaveLength(4);
      });

      it("findById should exclude deleted records by default", () => {
        const result = repo.findById("deleted-1");
        expect(result).toBeUndefined();
      });

      it("findById should include deleted records when includeDeleted is true", () => {
        const result = repo.findById("deleted-1", { includeDeleted: true });
        expect(result).toBeDefined();
        expect((result as { id: string }).id).toBe("deleted-1");
      });

      it("findWhere should exclude deleted records by default", () => {
        const results = repo.findWhere({ status: "active" });
        expect(results).toHaveLength(2);
      });

      it("findWhere should include deleted records when includeDeleted is true", () => {
        const results = repo.findWhere({ status: "active" }, { includeDeleted: true });
        expect(results).toHaveLength(4);
      });
    });
  });
});
