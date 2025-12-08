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
export function createMockRecord(
  overrides: Partial<MockRecord> = {}
): MockRecord {
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
 * Mock database that mimics BetterSQLite3Database interface.
 * Allows setting return values for queries.
 */
export class MockDb {
  private _results: MockRecord[] = [];
  private _insertedRecords: MockRecord[] = [];

  /**
   * Set the results that queries will return.
   * Call this before running repository methods to control output.
   */
  setResults(results: MockRecord[]): void {
    this._results = results;
  }

  /**
   * Get the currently configured results.
   */
  getResults(): MockRecord[] {
    return this._results;
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
    this._insertedRecords = [];
  }

  /**
   * Mimics db.select() - returns a query builder.
   */
  select(): MockQueryBuilder {
    return new MockQueryBuilder(this);
  }

  /**
   * Mimics db.insert() - captures inserted values.
   */
  insert(_table: unknown): {
    values: (record: MockRecord) => { run: () => void };
  } {
    return {
      values: (record: MockRecord) => ({
        run: () => {
          this._insertedRecords.push(record);
        },
      }),
    };
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
