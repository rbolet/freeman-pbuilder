/**
 * Mock database and table for testing repository logic in complete isolation.
 * No Drizzle ORM dependency - pure mock objects with configurable return values.
 *
 * Use this when you need to:
 * - Test repository error handling (e.g., duplicate IDs)
 * - Control query results without database constraints
 * - Test in complete isolation from Drizzle/SQLite
 */

/**
 * Standard record structure matching our common table schema pattern.
 * All entity tables have: id, name (optional), audit timestamps.
 */
export interface MockRecord {
  id: string;
  name: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Factory function to create mock records with sensible defaults.
 */
export function createMockRecord(overrides: Partial<MockRecord> = {}): MockRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "Mock Record",
    status: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

/**
 * Mock column that mimics Drizzle column interface for eq() comparisons.
 */
interface MockColumn {
  name: string;
}

/**
 * Mock table that mimics Drizzle SQLiteTable interface.
 * Provides column accessors needed by BaseRepository.
 */
export interface MockTable {
  id: MockColumn;
  name: MockColumn;
  status: MockColumn;
  createdAt: MockColumn;
  updatedAt: MockColumn;
  deletedAt: MockColumn;
  $inferSelect: MockRecord;
  [key: string]: MockColumn | unknown;
}

/**
 * Create a mock table with column accessors.
 */
export function createMockTable(): MockTable {
  return {
    id: { name: "id" },
    name: { name: "name" },
    status: { name: "status" },
    createdAt: { name: "createdAt" },
    updatedAt: { name: "updatedAt" },
    deletedAt: { name: "deletedAt" },
    $inferSelect: {} as MockRecord,
  };
}

/**
 * Mock query builder that mimics Drizzle's fluent interface.
 * Captures query state and returns configured results.
 */
class MockQueryBuilder {
  private _results: MockRecord[] = [];

  constructor(private mockDb: MockDb) {}

  from(_table: unknown): this {
    // Reset to configured results on each query
    this._results = [...this.mockDb.getResults()];
    return this;
  }

  where(_condition: unknown): this {
    // The condition is captured but filtering is done based on mockDb configuration
    // For more sophisticated mocking, we could parse the condition
    return this;
  }

  all(): MockRecord[] {
    return this._results;
  }
}

/**
 * Mock update builder that mimics Drizzle's update fluent interface.
 */
class MockUpdateBuilder {
  private _updateResults: Array<{ id: string }> = [];

  constructor(private mockDb: MockDb) {}

  set(_changes: unknown): this {
    return this;
  }

  where(_condition: unknown): this {
    // Use the configured update results
    this._updateResults = [...this.mockDb.getUpdateResults()];
    return this;
  }

  returning(_columns: unknown): this {
    return this;
  }

  all(): Array<{ id: string }> {
    return this._updateResults;
  }
}

/**
 * Mock insert builder that mimics Drizzle's insert fluent interface.
 */
class MockInsertBuilder {
  private _insertResults: Array<{ id: string }> = [];
  private _valuesToInsert: unknown[] = [];

  constructor(private mockDb: MockDb) {}

  values(records: unknown | unknown[]): this {
    this._valuesToInsert = Array.isArray(records) ? records : [records];
    return this;
  }

  returning(_columns: unknown): this {
    // Use configured insert results, or generate from values
    const configured = this.mockDb.getInsertResults();
    if (configured.length > 0) {
      this._insertResults = configured;
    } else {
      // Default: return IDs from the values if they have them, or generate new ones
      this._insertResults = this._valuesToInsert.map((v) => ({
        id: (v as { id?: string }).id ?? crypto.randomUUID(),
      }));
    }
    return this;
  }

  all(): Array<{ id: string }> {
    return this._insertResults;
  }

  run(): void {
    // For backwards compatibility - just store the records
    for (const record of this._valuesToInsert) {
      this.mockDb.addInsertedRecord(record as MockRecord);
    }
  }
}

/**
 * Mock database that mimics BetterSQLite3Database interface.
 * Allows setting return values for queries.
 */
export class MockDb {
  private _results: MockRecord[] = [];
  private _updateResults: Array<{ id: string }> = [];
  private _insertResults: Array<{ id: string }> = [];
  private _insertedRecords: MockRecord[] = [];

  /**
   * Set the results that select queries will return.
   * Call this before running repository methods to control output.
   */
  setResults(results: MockRecord[]): void {
    this._results = results;
  }

  /**
   * Get the currently configured select results.
   */
  getResults(): MockRecord[] {
    return this._results;
  }

  /**
   * Set the results that update queries will return (for .returning()).
   * Pass an array of objects with id property to simulate updated records.
   */
  setUpdateResults(results: Array<{ id: string }>): void {
    this._updateResults = results;
  }

  /**
   * Get the currently configured update results.
   */
  getUpdateResults(): Array<{ id: string }> {
    return this._updateResults;
  }

  /**
   * Set the results that insert queries will return (for .returning()).
   * Pass an array of objects with id property to simulate inserted records.
   */
  setInsertResults(results: Array<{ id: string }>): void {
    this._insertResults = results;
  }

  /**
   * Get the currently configured insert results.
   */
  getInsertResults(): Array<{ id: string }> {
    return this._insertResults;
  }

  /**
   * Add a record to the list of inserted records.
   */
  addInsertedRecord(record: MockRecord): void {
    this._insertedRecords.push(record);
  }

  /**
   * Get all records that were "inserted" via the mock.
   */
  getInsertedRecords(): MockRecord[] {
    return this._insertedRecords;
  }

  /**
   * Clear all configured results and inserted records.
   */
  reset(): void {
    this._results = [];
    this._updateResults = [];
    this._insertResults = [];
    this._insertedRecords = [];
  }

  /**
   * Mimics db.select() - returns a query builder.
   */
  select(): MockQueryBuilder {
    return new MockQueryBuilder(this);
  }

  /**
   * Mimics db.update() - returns an update builder.
   */
  update(_table: unknown): MockUpdateBuilder {
    return new MockUpdateBuilder(this);
  }

  /**
   * Mimics db.insert() - returns an insert builder.
   */
  insert(_table: unknown): MockInsertBuilder {
    return new MockInsertBuilder(this);
  }
}

/**
 * Create a complete mock setup with sensible defaults.
 * Returns both the mock db and mock table ready for use.
 */
export function createMockSetup(defaultResults: MockRecord[] = []): {
  db: MockDb;
  table: MockTable;
} {
  const db = new MockDb();
  db.setResults(defaultResults);

  return {
    db,
    table: createMockTable(),
  };
}
