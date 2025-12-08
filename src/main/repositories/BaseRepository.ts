import { eq, and, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Base table type that all entity tables should conform to.
 * Enforces common columns: id (primary key) and audit timestamps.
 *
 * Export this for any repositories that may not extend BaseRepository
 * but still need to work with standard table structures.
 */
export interface BaseTable extends SQLiteTable {
  id: SQLiteColumn;
  createdAt: SQLiteColumn;
  updatedAt: SQLiteColumn;
  deletedAt: SQLiteColumn;
}

/**
 * Inferred record type for tables that conform to BaseTable.
 * All records have id and audit timestamps.
 */
export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Options for the transform method
 */
export interface TransformOptions {
  /** Include audit timestamps (createdAt, updatedAt, deletedAt) in output */
  includeTimestamps?: boolean;
}

/**
 * Base repository class providing common database operations.
 * Inject a Drizzle table schema to get typed queries.
 *
 * @typeParam T - The Drizzle table type (must extend BaseTable)
 * @typeParam TOutput - The output type after transform (defaults to raw record)
 */
export class BaseRepository<T extends BaseTable, TOutput = T["$inferSelect"]> {
  constructor(
    protected db: BetterSQLite3Database,
    protected table: T
  ) {}

  /**
   * Transform a database record to the output type.
   * Override in subclasses to map to contract types.
   */
  protected transform(
    record: T["$inferSelect"],
    _options: TransformOptions = { includeTimestamps: false }
  ): TOutput {
    return record as unknown as TOutput;
  }

  /**
   * Transform an array of database records to the output type.
   */
  protected transformAll(
    records: T["$inferSelect"][],
    options: TransformOptions = { includeTimestamps: false }
  ): TOutput[] {
    return records.map((r) => this.transform(r, options));
  }

  /**
   * Find all records in the table
   */
  findAll(): TOutput[] {
    return this.transformAll(this.db.select().from(this.table).all());
  }

  /**
   * Find a single record by primary key
   * @throws Error if more than one record is found
   */
  findById(id: string): TOutput | undefined {
    const results = this.db.select().from(this.table).where(eq(this.table.id, id)).all();

    if (results.length > 1) {
      throw new Error(`Expected 0 or 1 record for id "${id}", but found ${results.length}`);
    }

    return results[0] ? this.transform(results[0]) : undefined;
  }

  /**
   * Find records matching the given conditions
   * @param conditions - Object with column/value pairs to filter by
   */
  findWhere(conditions: Partial<T["$inferSelect"]>): TOutput[] {
    const entries = Object.entries(conditions);
    if (entries.length === 0) {
      return this.findAll();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = this.table as any;
    const clauses = entries.map(([column, value]) => eq(table[column], value));

    return this.transformAll(
      this.db
        .select()
        .from(this.table)
        .where(and(...clauses))
        .all()
    );
  }

  /**
   * Update one or more records by ID
   * @param id - A single ID or array of IDs to update
   * @param changes - Partial record with fields to update
   * @returns Array of IDs that were successfully updated
   * @throws Error if any of the provided IDs were not found
   */
  updateById(id: string | string[], changes: Partial<T["$inferSelect"]>): string[] {
    const ids = Array.isArray(id) ? id : [id];

    if (ids.length === 0) {
      throw new Error("No IDs provided for update");
    }

    const whereClause = ids.length === 1 ? eq(this.table.id, ids[0]) : inArray(this.table.id, ids);

    const updatedRows = this.db
      .update(this.table)
      .set(changes as Record<string, unknown>)
      .where(whereClause)
      .returning({ id: this.table.id })
      .all();

    const updatedIds = updatedRows.map((row) => row.id as string);

    // Check if all requested IDs were updated
    if (updatedIds.length !== ids.length) {
      const notFoundIds = ids.filter((id) => !updatedIds.includes(id));
      throw new Error(
        `Records not found for IDs: ${notFoundIds.map((id) => `"${id}"`).join(", ")}`
      );
    }

    return updatedIds;
  }
}
