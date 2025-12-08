import { z } from "zod";

const uuidSchema = z.uuid();

/**
 * Validates that a string is a valid UUID.
 * @param value - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

/**
 * Validates that a string is a valid UUID, throwing if invalid.
 * @param value - The string to validate
 * @param name - Optional name for error message (e.g., "id" or "ids[0]")
 * @throws Error if not a valid UUID
 */
export function validateUUID(value: string, name = "value"): void {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid UUID for ${name}: "${value}"`);
  }
}

/**
 * Validates that all strings in an array are valid UUIDs.
 * @param values - The array of strings to validate
 * @param name - Optional name for error message
 * @throws Error if any value is not a valid UUID
 */
export function validateUUIDs(values: string[], name = "ids"): void {
  const invalid = values.filter((v) => !isValidUUID(v));
  if (invalid.length > 0) {
    throw new Error(`Invalid UUIDs for ${name}: ${invalid.map((v) => `"${v}"`).join(", ")}`);
  }
}
