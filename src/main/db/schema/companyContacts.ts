import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id, name } from "./columns";
import { companies } from "./companies";

/**
 * Company contacts table schema
 *
 * Point of contact person at a company. A company may have multiple contacts.
 */
export const companyContacts = sqliteTable("company_contacts", {
  id,
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name,
  phone: text("phone"),
  email: text("email"),
  role: text("role"), // e.g., job title like "Sales Rep", "Account Manager"
  ...auditTimestamps,
});

export type CompanyContactRecord = typeof companyContacts.$inferSelect;
export type NewCompanyContactRecord = typeof companyContacts.$inferInsert;
