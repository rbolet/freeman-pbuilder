import { z } from "zod";

/**
 * User - the app user with their "self" company info
 * id is the user id (from settings), not company_relationships.id
 */
export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  companyId: z.uuid(),
  companyName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
});
export type User = z.infer<typeof userSchema>;
