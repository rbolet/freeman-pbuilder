import { z } from "zod";

/**
 * Enum schemas matching database enums
 */
export const companyRelationshipTypeSchema = z.enum(["SELF", "CUSTOMER", "VENDOR"]);
export type CompanyRelationshipType = z.infer<typeof companyRelationshipTypeSchema>;

export const paymentTermsSchema = z.enum(["NET_30", "NET_45", "NET_60"]);
export type PaymentTerms = z.infer<typeof paymentTermsSchema>;

/**
 * Company contact
 */
export const companyContactSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string().nullable(),
});
export type CompanyContact = z.infer<typeof companyContactSchema>;

/**
 * Relationship terms - for dropdown select
 */
export const relationshipTermsSchema = z.object({
  id: z.uuid(),
  terms: paymentTermsSchema,
});
export type RelationshipTerms = z.infer<typeof relationshipTermsSchema>;

/**
 * Customer - company with CUSTOMER relationship
 * id is company_relationships.id
 */
export const customerSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  companyName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  contacts: z.array(companyContactSchema),
  terms: relationshipTermsSchema.nullable(),
  startDate: z.iso.datetime(),
});
export type Customer = z.infer<typeof customerSchema>;

/**
 * Vendor - company with VENDOR relationship
 * id is company_relationships.id
 */
export const vendorSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  companyName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  contacts: z.array(companyContactSchema),
  terms: relationshipTermsSchema.nullable(),
  startDate: z.iso.datetime(),
});
export type Vendor = z.infer<typeof vendorSchema>;
