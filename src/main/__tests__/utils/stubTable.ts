import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Stub Drizzle table for testing repositories
 */
export const stubTable = sqliteTable("stub_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export type StubRecord = typeof stubTable.$inferSelect;
export type NewStubRecord = typeof stubTable.$inferInsert;

/**
 * Factory for creating stub records with defaults
 */
export function createStubRecord(overrides: Partial<StubRecord> = {}): StubRecord {
  return {
    id: "test-uuid-1234",
    name: "Test Record",
    status: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}
