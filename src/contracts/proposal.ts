import { z } from "zod";

/**
 * Proposal head - summary data for a proposal
 * Used when listing proposals or nesting in other contracts
 */
export const proposalHeadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  finalOn: z.iso.datetime().nullable(),
  submittedOn: z.iso.datetime().nullable(),
  acceptedOn: z.iso.datetime().nullable(),
});
export type ProposalHead = z.infer<typeof proposalHeadSchema>;

/**
 * Proposal line item with nested proposal head
 */
export const proposalLineItemSchema = z.object({
  id: z.uuid(),
  proposal: proposalHeadSchema,
  itemId: z.uuid(),
  itemName: z.string().min(1),
  itemDescription: z.string().nullable(),
  itemType: z.enum(["LABOR", "MATERIAL", "MISC"]),
  vendorId: z.uuid().nullable(), // company_relationships.id (vendor relationship)
  vendorName: z.string().nullable(),
  uom: z.string().min(1), // unit of measure name
  quantity: z.number(),
  cost: z.number(),
  sell: z.number(),
});
export type ProposalLineItem = z.infer<typeof proposalLineItemSchema>;

/**
 * Schema for creating a new proposal
 */
export const createProposalSchema = z.object({
  projectId: z.uuid(),
  name: z.string().min(1).max(255),
});
export type CreateProposal = z.infer<typeof createProposalSchema>;

/**
 * Schema for updating an existing proposal
 */
export const updateProposalSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255).optional(),
  finalOn: z.iso.datetime().nullable().optional(),
  submittedOn: z.iso.datetime().nullable().optional(),
  acceptedOn: z.iso.datetime().nullable().optional(),
});
export type UpdateProposal = z.infer<typeof updateProposalSchema>;
