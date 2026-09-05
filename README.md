# AI Interview Index

Which companies let you use AI in their coding interviews, which ban it, and which
built the interview around it. Live at **[aiinterviewindex.com](https://aiinterviewindex.com)**.

Anyone can edit, no account needed. Companion to a blog post on why coding
interviews should allow AI.

## Categories

One label per company, deliberately:

- **No AI in interviews** — banned in the technical rounds.
- **Has AI interviews** — allowed in at least one round.
- **AI-native interviews** — the interview is built around it.

Entries come from two places: published policies (engineering blogs, careers
pages, handbooks) and first-hand candidate reports. Where a company has written
about its stance, the links are on its page.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind v4 with shadcn/ui, Drizzle on
Postgres (Neon), deployed on Netlify.

```bash
bun install
cp .env.example .env      # fill in DATABASE_URL
bun run db:seed           # insert the starting companies
bun run dev               # http://localhost:3077
```

## How editing works

Edits publish **instantly**. There is no moderation queue. What makes that
workable is the other half of the design:

- every write appends to `revisions` before touching `companies`
- `/changes` lists the last 50 edits with one-click revert
- a revert is itself a revision, so reverting a revert works
- nothing is ever hard-deleted

## Abuse controls

Rate limits cap how *many* edits land; the edit filter caps how much damage one
edit can do.

- **Turnstile** on every write. A scripted POST with no token is refused.
- **Rate limits**, counted in Postgres so they survive cold starts and hold
  across serverless instances: 8 edits per editor per 10 minutes, 60 globally.
- **Edit filter** refusing the shapes vandalism takes: blanking a description,
  removing most of one, link spam, keyboard mashing, and renaming a company into
  an impersonation of another.
- **Honeypot** field that answers like a success and writes nothing.
- **Cooldown**: the same editor cannot rewrite the same entry twice within five
  minutes. Other editors are unaffected, so nobody can squat a row.
- **`/api/rollback`** undoes an editor's whole spree in one call, restoring each
  affected company to its state before they first touched it. Admin-only: public
  rollback would itself be the attack.

Omitted fields mean *unchanged*, so a partial update cannot silently null the
fields it did not send.

## About IP addresses

Raw IPs are never stored. An editor is identified by a truncated HMAC of their
address keyed on `IP_HASH_SECRET`, which should be rotated periodically — a plain
hash would be trivially reversible by enumerating the v4 space. The hash is used
for rate limiting and is never displayed.

## Migrations

`bunx drizzle-kit generate`, then move the generated `.sql` into
`netlify/database/migrations/<timestamp>_<name>/migration.sql` and apply it with
`psql "$DATABASE_URL" -f <that file>`. Drizzle writes a flat file; the migration
runner expects one directory per migration.

`src/db/seed.ts` is generated from the database, so regenerate it rather than
hand-editing when entries change.

## Licence

Content is CC BY-SA 4.0. Code is MIT.
