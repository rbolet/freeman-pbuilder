import { z } from "zod";
import { auditFieldsSchema } from "./common";

/**
 * Proposal entity schema for IPC communication
 */
export const proposalSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
  })
  .merge(auditFieldsSchema);

export type Proposal = z.infer<typeof proposalSchema>;

/**
 * Schema for creating a new proposal
 */
export const createProposalSchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateProposal = z.infer<typeof createProposalSchema>;

/**
 * Schema for updating an existing proposal
 */
export const updateProposalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
});

export type UpdateProposal = z.infer<typeof updateProposalSchema>;
