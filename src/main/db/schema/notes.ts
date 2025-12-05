import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { auditTimestamps, id } from "./columns";
import { noteEntityTypes } from "./enums";

/**
 * Notes table schema
 *
 * Polymorphic notes that can be attached to various entities.
 * Uses entity_type + entity_id pattern for polymorphic reference.
 */
export const notes = sqliteTable("notes", {
  id,
  entityType: text("entity_type", { enum: noteEntityTypes }).notNull(),
  entityId: text("entity_id").notNull(), // Polymorphic FK - validated via app logic
  content: text("content").notNull(),
  ...auditTimestamps,
});

export type NoteRecord = typeof notes.$inferSelect;
export type NewNoteRecord = typeof notes.$inferInsert;
