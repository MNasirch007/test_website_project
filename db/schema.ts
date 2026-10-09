import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces', {
  ownerId: text('owner_id').primaryKey(),
  publicId: text('public_id').notNull().unique(),
  data: text('data').notNull(),
  revision: integer('revision').notNull().default(0),
});
