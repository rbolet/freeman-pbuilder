import { describe, it, expect, beforeAll, afterAll } from "vitest";
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

interface ForeignKeyInfo {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
  match: string;
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

  afterAll(() => {
    closeDatabase();
    // Clean up test database files
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    const walPath = `${testDbPath}-wal`;
    const shmPath = `${testDbPath}-shm`;
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  });

  // Helper to get table columns
  const getTableColumns = (tableName: string): TableInfo[] => {
    const db = getDatabase();
    return db.all<TableInfo>(sql.raw(`PRAGMA table_info(${tableName})`));
  };

  // Helper to get foreign keys
  const getForeignKeys = (tableName: string): ForeignKeyInfo[] => {
    const db = getDatabase();
    return db.all<ForeignKeyInfo>(sql.raw(`PRAGMA foreign_key_list(${tableName})`));
  };

  // Helper to check if table exists
  const tableExists = (tableName: string): boolean => {
    const db = getDatabase();
    const tables = db.all<TableListItem>(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${tableName}`
    );
    return tables.length === 1;
  };

  // Helper to check standard columns (id, created_at, updated_at, deleted_at)
  const hasStandardColumns = (tableName: string): void => {
    const columns = getTableColumns(tableName);
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("created_at");
    expect(columnNames).toContain("updated_at");
    expect(columnNames).toContain("deleted_at");

    const idCol = columns.find((c) => c.name === "id");
    expect(idCol?.pk).toBe(1);
    expect(idCol?.type.toUpperCase()).toBe("TEXT");
  };

  describe("All tables exist", () => {
    const expectedTables = [
      "companies",
      "company_contacts",
      "company_relationships",
      "company_relationship_terms",
      "units_of_measure",
      "standard_line_items",
      "vendor_item_costs",
      "projects",
      "proposals",
      "proposal_line_items",
      "notes",
    ];

    it.each(expectedTables)("table '%s' should exist", (tableName) => {
      expect(tableExists(tableName)).toBe(true);
    });

    it.each(expectedTables)("table '%s' should have standard columns", (tableName) => {
      hasStandardColumns(tableName);
    });
  });

  describe("companies table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("companies");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("name");
      expect(columnNames).toContain("address1");
      expect(columnNames).toContain("address2");
      expect(columnNames).toContain("city");
      expect(columnNames).toContain("state");
      expect(columnNames).toContain("postal_code");
    });

    it("should have correct NOT NULL constraints", () => {
      const columns = getTableColumns("companies");

      const notNullCols = ["name", "address1", "city", "state", "postal_code"];
      notNullCols.forEach((colName) => {
        const col = columns.find((c) => c.name === colName);
        expect(col?.notnull, `${colName} should be NOT NULL`).toBe(1);
      });

      const nullableCols = ["address2"];
      nullableCols.forEach((colName) => {
        const col = columns.find((c) => c.name === colName);
        expect(col?.notnull, `${colName} should be nullable`).toBe(0);
      });
    });
  });

  describe("company_contacts table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("company_contacts");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("company_id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("phone");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("role");
    });

    it("should have FK to companies", () => {
      const fks = getForeignKeys("company_contacts");
      const companyFk = fks.find((fk) => fk.table === "companies");

      expect(companyFk).toBeDefined();
      expect(companyFk?.from).toBe("company_id");
      expect(companyFk?.to).toBe("id");
    });
  });

  describe("company_relationships table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("company_relationships");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("company_id");
      expect(columnNames).toContain("relationship");
      expect(columnNames).toContain("start_date");
    });

    it("should have FK to companies", () => {
      const fks = getForeignKeys("company_relationships");
      const companyFk = fks.find((fk) => fk.table === "companies");

      expect(companyFk).toBeDefined();
      expect(companyFk?.from).toBe("company_id");
    });
  });

  describe("company_relationship_terms table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("company_relationship_terms");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("company_relationship_id");
      expect(columnNames).toContain("terms");
    });

    it("should have FK to company_relationships", () => {
      const fks = getForeignKeys("company_relationship_terms");
      const relationshipFk = fks.find((fk) => fk.table === "company_relationships");

      expect(relationshipFk).toBeDefined();
      expect(relationshipFk?.from).toBe("company_relationship_id");
    });
  });

  describe("units_of_measure table", () => {
    it("should have name column", () => {
      const columns = getTableColumns("units_of_measure");
      const nameCol = columns.find((c) => c.name === "name");

      expect(nameCol).toBeDefined();
      expect(nameCol?.notnull).toBe(1);
    });
  });

  describe("standard_line_items table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("standard_line_items");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("name");
      expect(columnNames).toContain("description");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("manufacturer_id");
      expect(columnNames).toContain("manufacturer_name");
      expect(columnNames).toContain("manufacturer_identifier");
    });

    it("should have nullable manufacturer_id FK", () => {
      const columns = getTableColumns("standard_line_items");
      const manufacturerIdCol = columns.find((c) => c.name === "manufacturer_id");

      expect(manufacturerIdCol?.notnull).toBe(0); // Nullable
    });
  });

  describe("vendor_item_costs table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("vendor_item_costs");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("standard_line_item_id");
      expect(columnNames).toContain("vendor_id");
      expect(columnNames).toContain("uom_id");
      expect(columnNames).toContain("cost");
    });

    it("should have correct FKs", () => {
      const fks = getForeignKeys("vendor_item_costs");

      expect(fks.find((fk) => fk.table === "standard_line_items")).toBeDefined();
      expect(fks.find((fk) => fk.table === "companies")).toBeDefined();
      expect(fks.find((fk) => fk.table === "units_of_measure")).toBeDefined();
    });

    it("should have cost as REAL type", () => {
      const columns = getTableColumns("vendor_item_costs");
      const costCol = columns.find((c) => c.name === "cost");

      expect(costCol?.type.toUpperCase()).toBe("REAL");
    });
  });

  describe("projects table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("projects");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("customer_id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("projected_start_date");
    });

    it("should have FK to company_relationships", () => {
      const fks = getForeignKeys("projects");
      const customerFk = fks.find((fk) => fk.table === "company_relationships");

      expect(customerFk).toBeDefined();
      expect(customerFk?.from).toBe("customer_id");
    });
  });

  describe("proposals table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("proposals");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("project_id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("final_on");
      expect(columnNames).toContain("submitted_on");
      expect(columnNames).toContain("accepted_on");
    });

    it("should have FK to projects", () => {
      const fks = getForeignKeys("proposals");
      const projectFk = fks.find((fk) => fk.table === "projects");

      expect(projectFk).toBeDefined();
      expect(projectFk?.from).toBe("project_id");
    });

    it("should have nullable status timestamps", () => {
      const columns = getTableColumns("proposals");

      const nullableCols = ["final_on", "submitted_on", "accepted_on"];
      nullableCols.forEach((colName) => {
        const col = columns.find((c) => c.name === colName);
        expect(col?.notnull, `${colName} should be nullable`).toBe(0);
      });
    });
  });

  describe("proposal_line_items table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("proposal_line_items");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("proposal_id");
      expect(columnNames).toContain("item_id");
      expect(columnNames).toContain("vendor_id");
      expect(columnNames).toContain("uom_id");
      expect(columnNames).toContain("quantity");
      expect(columnNames).toContain("cost");
      expect(columnNames).toContain("sell");
    });

    it("should have correct FKs", () => {
      const fks = getForeignKeys("proposal_line_items");

      expect(fks.find((fk) => fk.table === "proposals")).toBeDefined();
      expect(fks.find((fk) => fk.table === "standard_line_items")).toBeDefined();
      expect(fks.find((fk) => fk.table === "units_of_measure")).toBeDefined();
      // vendor_id FK to companies
      expect(fks.find((fk) => fk.table === "companies")).toBeDefined();
    });

    it("should have numeric columns as REAL type", () => {
      const columns = getTableColumns("proposal_line_items");

      const realCols = ["quantity", "cost", "sell"];
      realCols.forEach((colName) => {
        const col = columns.find((c) => c.name === colName);
        expect(col?.type.toUpperCase(), `${colName} should be REAL`).toBe("REAL");
      });
    });

    it("should have nullable vendor_id", () => {
      const columns = getTableColumns("proposal_line_items");
      const vendorIdCol = columns.find((c) => c.name === "vendor_id");

      expect(vendorIdCol?.notnull).toBe(0);
    });
  });

  describe("notes table", () => {
    it("should have all expected columns", () => {
      const columns = getTableColumns("notes");
      const columnNames = columns.map((c) => c.name);

      expect(columnNames).toContain("entity_type");
      expect(columnNames).toContain("entity_id");
      expect(columnNames).toContain("content");
    });

    it("should have NOT NULL constraints on required fields", () => {
      const columns = getTableColumns("notes");

      const notNullCols = ["entity_type", "entity_id", "content"];
      notNullCols.forEach((colName) => {
        const col = columns.find((c) => c.name === colName);
        expect(col?.notnull, `${colName} should be NOT NULL`).toBe(1);
      });
    });
  });
});
