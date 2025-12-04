import { z } from "zod";

/**
 * Base audit fields included in all database entities
 */
export const auditFieldsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

export type AuditFields = z.infer<typeof auditFieldsSchema>;
