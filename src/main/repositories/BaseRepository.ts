import { eq, and } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

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
 * @typeParam T - The Drizzle table type
 * @typeParam TOutput - The output type after transform (defaults to raw record)
 */
export class BaseRepository<
  T extends SQLiteTable & { $inferSelect: unknown },
  TOutput = T["$inferSelect"],
> {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = this.table as any;
    const results = this.db
      .select()
      .from(this.table)
      .where(eq(table.id, id))
      .all();

    if (results.length > 1) {
      throw new Error(
        `Expected 0 or 1 record for id "${id}", but found ${results.length}`
      );
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
}
