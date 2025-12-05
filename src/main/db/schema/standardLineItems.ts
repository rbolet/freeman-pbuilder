import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";
import { companies } from "./companies";
import { lineItemTypes } from "./enums";

/**
 * Standard line items table schema
 *
 * Master catalog of standardized/default line items for labor, material, or misc.
 * This list is fairly immutable - items may become unavailable but are rarely modified.
 */
export const standardLineItems = sqliteTable("standard_line_items", {
  id,
  name,
  description: text("description"),
  type: text("type", { enum: lineItemTypes }).notNull(),
  // Manufacturer info - manufacturer_id is nullable to allow entry without company record
  manufacturerId: text("manufacturer_id").references(() => companies.id),
  manufacturerName: text("manufacturer_name"), // For display when manufacturer_id not set
  manufacturerIdentifier: text("manufacturer_identifier"), // Human-readable ID like model/serial
  ...auditTimestamps,
});

export type StandardLineItemRecord = typeof standardLineItems.$inferSelect;
export type NewStandardLineItemRecord = typeof standardLineItems.$inferInsert;
