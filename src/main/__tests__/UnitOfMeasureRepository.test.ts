import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import BetterSqlite3, { Database } from "better-sqlite3";
import { UnitOfMeasureRepository } from "../repositories/UnitOfMeasureRepository";
import { unitsOfMeasure } from "../db/schema/unitsOfMeasure";

describe("UnitOfMeasureRepository", () => {
  let sqlite: Database;
  let db: BetterSQLite3Database;
  let repo: UnitOfMeasureRepository;

  beforeEach(() => {
    // Create in-memory database
    sqlite = new BetterSqlite3(":memory:");

    // Create the units_of_measure table
    sqlite.exec(`
      CREATE TABLE units_of_measure (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      )
    `);

    db = drizzle(sqlite);
    repo = new UnitOfMeasureRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("insert", () => {
    it("should insert a unit of measure and return its ID", () => {
      const ids = repo.insert({ name: "each" });

      expect(ids).toHaveLength(1);
      expect(ids[0]).toBeDefined();
    });

    it("should insert multiple units of measure", () => {
      const ids = repo.insert({ name: "linear foot" }, { qty: 3 });

      expect(ids).toHaveLength(3);
    });

    it("should insert with provided IDs", () => {
      const providedIds = [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ];

      const ids = repo.insert({ name: "hour" }, { qty: 2, ids: providedIds });

      expect(ids).toEqual(providedIds);
    });
  });

  describe("findAll", () => {
    it("should return all units of measure", () => {
      repo.insert({ name: "each" });
      repo.insert({ name: "linear foot" });
      repo.insert({ name: "hour" });

      const results = repo.findAll();

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.name).sort()).toEqual(["each", "hour", "linear foot"]);
    });

    it("should return transformed records (id and name only)", () => {
      repo.insert({ name: "square foot" });

      const results = repo.findAll();

      expect(results).toHaveLength(1);
      expect(Object.keys(results[0]).sort()).toEqual(["id", "name"]);
      expect(results[0].name).toBe("square foot");
    });

    it("should exclude soft-deleted records by default", () => {
      const ids = repo.insert({ name: "deleted unit" });
      repo.insert({ name: "active unit" });

      repo.deleteById(ids[0]);

      const results = repo.findAll();
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("active unit");
    });
  });

  describe("findById", () => {
    it("should return a unit of measure by ID", () => {
      const ids = repo.insert({ name: "cubic yard" });

      const result = repo.findById(ids[0]);

      expect(result).toBeDefined();
      expect(result!.id).toBe(ids[0]);
      expect(result!.name).toBe("cubic yard");
    });

    it("should return undefined for non-existent ID", () => {
      const result = repo.findById("nonexistent-id");

      expect(result).toBeUndefined();
    });

    it("should return undefined for soft-deleted record by default", () => {
      const ids = repo.insert({ name: "deleted" });
      repo.deleteById(ids[0]);

      const result = repo.findById(ids[0]);
      expect(result).toBeUndefined();
    });

    it("should return soft-deleted record when includeDeleted is true", () => {
      const ids = repo.insert({ name: "deleted" });
      repo.deleteById(ids[0]);

      const result = repo.findById(ids[0], { includeDeleted: true });
      expect(result).toBeDefined();
      expect(result!.name).toBe("deleted");
    });
  });

  describe("findWhere", () => {
    it("should find records by name", () => {
      repo.insert({ name: "each" });
      repo.insert({ name: "hour" });
      repo.insert({ name: "each" }); // duplicate name

      const results = repo.findWhere({ name: "each" });

      expect(results).toHaveLength(2);
      results.forEach((r) => expect(r.name).toBe("each"));
    });
  });

  describe("updateById", () => {
    it("should update a unit of measure", () => {
      const ids = repo.insert({ name: "old name" });

      const updatedIds = repo.updateById(ids[0], { name: "new name" });

      expect(updatedIds).toEqual(ids);

      const updated = repo.findById(ids[0]);
      expect(updated!.name).toBe("new name");
    });

    it("should throw error for non-existent ID", () => {
      expect(() => repo.updateById("nonexistent", { name: "test" })).toThrow(
        'Records not found for IDs: "nonexistent"'
      );
    });
  });

  describe("deleteById and restoreById", () => {
    it("should soft delete and restore a unit of measure", () => {
      const ids = repo.insert({ name: "soft delete test" });

      // Delete
      repo.deleteById(ids[0]);
      expect(repo.findById(ids[0])).toBeUndefined();

      // Restore
      repo.restoreById(ids[0]);
      expect(repo.findById(ids[0])).toBeDefined();
    });
  });

  describe("emptyTrashById", () => {
    it("should permanently delete a unit of measure", () => {
      const ids = repo.insert({ name: "hard delete test" });

      repo.emptyTrashById(ids[0]);

      // Should not exist even with includeDeleted
      const result = repo.findById(ids[0], { includeDeleted: true });
      expect(result).toBeUndefined();

      // Verify it's actually gone from the database
      const rawResults = db.select().from(unitsOfMeasure).all();
      expect(rawResults).toHaveLength(0);
    });
  });

  describe("transform", () => {
    it("should only return id and name in output", () => {
      const ids = repo.insert({ name: "transform test" });

      const result = repo.findById(ids[0]);

      expect(result).toBeDefined();
      expect(result).toEqual({
        id: ids[0],
        name: "transform test",
      });
      // Verify no extra properties
      expect(Object.keys(result!)).toHaveLength(2);
    });
  });
});
