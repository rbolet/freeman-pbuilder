/**
 * Database enum definitions
 * SQLite doesn't have native enums, so we use TEXT with check constraints via Drizzle
 */

/**
 * Company relationship types
 * - SELF: The user's own company
 * - CUSTOMER: A customer company
 * - VENDOR: A vendor/supplier company
 */
export const companyRelationshipTypes = ["SELF", "CUSTOMER", "VENDOR"] as const;
export type CompanyRelationshipType = (typeof companyRelationshipTypes)[number];

/**
 * Payment terms for business relationships
 */
export const paymentTerms = ["NET_30", "NET_45", "NET_60"] as const;
export type PaymentTerms = (typeof paymentTerms)[number];

/**
 * Line item types
 * - LABOR: Labor/service line items
 * - MATERIAL: Physical materials
 * - MISC: Miscellaneous items
 */
export const lineItemTypes = ["LABOR", "MATERIAL", "MISC"] as const;
export type LineItemType = (typeof lineItemTypes)[number];

/**
 * Entity types for polymorphic notes
 */
export const noteEntityTypes = [
  "COMPANY",
  "COMPANY_CONTACT",
  "PROJECT",
  "PROPOSAL",
  "LINE_ITEM",
  "PROPOSAL_LINE_ITEM",
] as const;
export type NoteEntityType = (typeof noteEntityTypes)[number];
