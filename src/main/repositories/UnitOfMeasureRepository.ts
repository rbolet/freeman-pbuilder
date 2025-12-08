import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { unitsOfMeasure, UnitOfMeasureRecord } from "../db/schema/unitsOfMeasure";
import { BaseRepository, TransformOptions } from "./BaseRepository";
import { UnitOfMeasure } from "../../contracts/unitOfMeasure";

/**
 * Repository for units of measure.
 * Simple lookup table with id + name.
 */
export class UnitOfMeasureRepository extends BaseRepository<typeof unitsOfMeasure, UnitOfMeasure> {
  constructor(db: BetterSQLite3Database) {
    super(db, unitsOfMeasure);
  }

  protected transform(record: UnitOfMeasureRecord, _options: TransformOptions = {}): UnitOfMeasure {
    return {
      id: record.id,
      name: record.name,
    };
  }
}
