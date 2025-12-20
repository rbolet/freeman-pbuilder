import { z } from "zod";

export const validateUUID = (value: unknown): boolean => {
  const uuidSchema = z.string().uuid();
  try {
    uuidSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};
export const isValidUUID = validateUUID;

export const validateUUIDs = (values: unknown[]): boolean[] => {
  return values.map(validateUUID);
};
