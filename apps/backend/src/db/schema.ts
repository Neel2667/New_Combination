import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  importedAt: text('imported_at').notNull(),
  sha256: text('sha256').notNull(),
  licenseStatus: text('license_status').notNull(),
  commercialUse: integer('commercial_use', { mode: 'boolean' }).notNull(),
  modificationAllowed: integer('modification_allowed', { mode: 'boolean' }).notNull(),
  attributionRequired: integer('attribution_required', { mode: 'boolean' }).notNull(),
  source: text('source', { mode: 'json' }).notNull(),
  license: text('license', { mode: 'json' }).notNull(),
  media: text('media', { mode: 'json' }).notNull(),
  visual: text('visual', { mode: 'json' }).notNull(),
});
