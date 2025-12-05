import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id } from "./columns";
import { proposals } from "./proposals";
import { standardLineItems } from "./standardLineItems";
import { companies } from "./companies";
import { unitsOfMeasure } from "./unitsOfMeasure";

/**
 * Proposal line items table schema
 *
 * Line items on a specific proposal with pricing set for that proposal.
 * Cost and sell can differ from standard/vendor pricing based on customer,
 * project specifics, negotiations, etc.
 */
export const proposalLineItems = sqliteTable("proposal_line_items", {
  id,
  proposalId: text("proposal_id")
    .notNull()
    .references(() => proposals.id),
  itemId: text("item_id")
    .notNull()
    .references(() => standardLineItems.id),
  vendorId: text("vendor_id").references(() => companies.id), // Nullable - which vendor selected
  uomId: text("uom_id")
    .notNull()
    .references(() => unitsOfMeasure.id),
  quantity: real("quantity").notNull(),
  cost: real("cost").notNull(), // Per unit cost for this proposal
  sell: real("sell").notNull(), // Per unit sell price for this proposal
  ...auditTimestamps,
});

export type ProposalLineItemRecord = typeof proposalLineItems.$inferSelect;
export type NewProposalLineItemRecord = typeof proposalLineItems.$inferInsert;
