import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id } from "./columns";
import { companyRelationships } from "./companyRelationships";
import { paymentTerms } from "./enums";

/**
 * Company relationship terms table schema
 *
 * Payment/business terms for a specific relationship.
 * Allows different terms based on relationship type.
 */
export const companyRelationshipTerms = sqliteTable("company_relationship_terms", {
  id,
  companyRelationshipId: text("company_relationship_id")
    .notNull()
    .references(() => companyRelationships.id),
  terms: text("terms", { enum: paymentTerms }).notNull(),
  ...auditTimestamps,
});

export type CompanyRelationshipTermsRecord = typeof companyRelationshipTerms.$inferSelect;
export type NewCompanyRelationshipTermsRecord = typeof companyRelationshipTerms.$inferInsert;
