import { z } from "zod";

/**
 * Base audit fields included in all database entities
 */
export const auditFieldsSchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

export type AuditFields = z.infer<typeof auditFieldsSchema>;
