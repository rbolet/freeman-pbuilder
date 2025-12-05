import { sqliteTable } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";

/**
 * Units of measure table schema
 *
 * Lookup table for units of measure (e.g., "each", "linear foot", "hour").
 */
export const unitsOfMeasure = sqliteTable("units_of_measure", {
  id,
  name,
  ...auditTimestamps,
});

export type UnitOfMeasureRecord = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasureRecord = typeof unitsOfMeasure.$inferInsert;
