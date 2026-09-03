import { sql } from 'drizzle-orm'
import { index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core'

/** The three buckets. One label per company — deliberately simple. */
export const POLICIES = ['no_ai', 'has_ai', 'ai_native'] as const
export type Policy = (typeof POLICIES)[number]

export const POLICY_LABELS: Record<Policy, string> = {
  no_ai: 'No AI in interviews',
  has_ai: 'Has AI interviews',
  ai_native: 'AI-native interviews',
}

export const POLICY_BLURBS: Record<Policy, string> = {
  no_ai: 'AI tools are off the table in the technical rounds.',
  has_ai: 'At least one round lets you use AI, but the format predates it.',
  ai_native: 'The assessment was designed around working with AI.',
}

export const companies = pgTable(
  'companies',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    policy: text('policy').$type<Policy>().notNull(),
    /** How the technical process actually runs. Markdown-free plain text. */
    process: text('process').notNull().default(''),
    /** Where this came from: a blog post, a careers page, or "candidate report". */
    sourceUrl: text('source_url'),
    sourceNote: text('source_note'),
    /** Company homepage. Its hostname is also the key for the logo lookup. */
    website: text('website'),
    /** Free-text facets, for the VC-portfolio-style filter row. */
    city: text('city'),
    industry: text('industry'),
    updatedAt: integer('updated_at')
      .notNull()
      .default(sql`extract(epoch from now())::int`),
  },
  (t) => [index('companies_policy_idx').on(t.policy)],
)

/**
 * Every write appends a row here before touching `companies`, so any edit can be
 * reverted from the public changelog. `create` rows carry a null `before`.
 */
export const revisions = pgTable(
  'revisions',
  {
    id: serial('id').primaryKey(),
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<'create' | 'edit' | 'revert'>().notNull(),
    /** JSON snapshots of the editable fields, for diffing and reverting. */
    before: text('before'),
    after: text('after').notNull(),
    summary: text('summary').notNull().default(''),
    /** Rotating HMAC of the editor's IP. Never the IP itself, never shown. */
    editorHash: text('editor_hash'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`extract(epoch from now())::int`),
  },
  (t) => [index('revisions_created_idx').on(t.createdAt)],
)

export type Company = typeof companies.$inferSelect
export type Revision = typeof revisions.$inferSelect
