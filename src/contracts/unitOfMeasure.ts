import { z } from "zod";

/**
 * Unit of Measure - for dropdown select
 */
export const unitOfMeasureSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
});
export type UnitOfMeasure = z.infer<typeof unitOfMeasureSchema>;
