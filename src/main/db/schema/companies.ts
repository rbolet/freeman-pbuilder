import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";

/**
 * Companies table schema
 *
 * A company involved in business transactions. Could be a customer,
 * vendor, both, or the user's own company.
 */
export const companies = sqliteTable("companies", {
  id,
  name,
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  ...auditTimestamps,
});

export type CompanyRecord = typeof companies.$inferSelect;
export type NewCompanyRecord = typeof companies.$inferInsert;
