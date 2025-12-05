import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id } from "./columns";
import { standardLineItems } from "./standardLineItems";
import { companies } from "./companies";
import { unitsOfMeasure } from "./unitsOfMeasure";

/**
 * Vendor item costs table schema
 *
 * The cost of a standard line item from a particular vendor in a particular UOM.
 * Allows tracking different costs from different vendors for the same item.
 */
export const vendorItemCosts = sqliteTable("vendor_item_costs", {
  id,
  standardLineItemId: text("standard_line_item_id")
    .notNull()
    .references(() => standardLineItems.id),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => companies.id), // Constrained to vendors via app logic
  uomId: text("uom_id")
    .notNull()
    .references(() => unitsOfMeasure.id),
  cost: real("cost").notNull(),
  ...auditTimestamps,
});

export type VendorItemCostRecord = typeof vendorItemCosts.$inferSelect;
export type NewVendorItemCostRecord = typeof vendorItemCosts.$inferInsert;
