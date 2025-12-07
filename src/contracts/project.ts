import { z } from "zod";
import { proposalHeadSchema } from "./proposal";

/**
 * Project with nested proposal heads
 */
export const projectSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(), // company_relationships.id (customer relationship)
  customerName: z.string().min(1),
  name: z.string().min(1),
  projectedStartDate: z.iso.datetime().nullable(),
  proposals: z.array(proposalHeadSchema),
});
export type Project = z.infer<typeof projectSchema>;

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  customerId: z.uuid(), // company_relationships.id
  name: z.string().min(1).max(255),
  projectedStartDate: z.iso.datetime().nullable().optional(),
});
export type CreateProject = z.infer<typeof createProjectSchema>;

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255).optional(),
  projectedStartDate: z.iso.datetime().nullable().optional(),
});
export type UpdateProject = z.infer<typeof updateProjectSchema>;
