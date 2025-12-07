import { z } from "zod";

/**
 * Line item type enum
 */
export const lineItemTypeSchema = z.enum(["LABOR", "MATERIAL", "MISC"]);
export type LineItemType = z.infer<typeof lineItemTypeSchema>;

/**
 * Vendor cost for a line item - cost per specific UOM from a specific vendor
 */
export const vendorItemCostSchema = z.object({
  id: z.uuid(),
  vendorId: z.uuid(), // company_relationships.id (vendor relationship)
  vendorName: z.string().min(1),
  uom: z.string().min(1), // unit of measure name
  cost: z.number(),
});
export type VendorItemCost = z.infer<typeof vendorItemCostSchema>;

/**
 * Standard line item with vendor costs
 */
export const standardLineItemSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  type: lineItemTypeSchema,
  manufacturerName: z.string().nullable(),
  manufacturerIdentifier: z.string().nullable(), // model/serial number
  vendorCosts: z.array(vendorItemCostSchema),
});
export type StandardLineItem = z.infer<typeof standardLineItemSchema>;
