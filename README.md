# AI Interview Index

Which companies let you use AI in their coding interviews, which ban it, and
which built the interview around it. Anyone can edit, no account needed.

Companion to the blog post on why coding interviews should allow AI.

## Categories

One label per company, deliberately:

- **No AI in interviews** — AI tools are off the table in the technical rounds.
- **Has AI interviews** — at least one round lets you use AI, but the format predates it.
- **AI-native interviews** — the assessment was designed around working with AI.

## Stack

Next.js 15 (App Router) + TypeScript + Drizzle on libSQL. Local dev is a SQLite
file, production points at Turso. No database daemon to leave running.

## Running it

```bash
bun install
cp .env.example .env.local
bun run db:push     # create tables in local.db
bun run db:seed     # insert the starting companies
bun run dev         # http://localhost:3077
```

## How editing works

Edits publish **instantly**. There is no moderation queue. What makes that
workable is the other half of the design:

- every write appends to `revisions` before touching `companies`
- `/changes` lists the last 50 edits with one-click revert
- a revert is itself a revision, so reverting a revert works
- nothing is ever hard-deleted

Abuse controls are a Cloudflare Turnstile checkbox (skipped entirely when
`TURNSTILE_SECRET_KEY` is unset, so local dev needs no keys) plus a per-editor
rate limit of 12 edits per 10 minutes.

## About IP addresses

Raw IPs are never stored. An editor is identified by a truncated HMAC of their
address keyed on `IP_HASH_SECRET`, which should be rotated periodically — a
plain hash would be trivially reversible by enumerating the v4 space. The hash
is used for rate limiting and abuse cleanup and is never displayed.

## Deploying

Vercel plus a Turso database:

```bash
turso db create ai-interview-index
turso db show ai-interview-index --url        # -> DATABASE_URL
turso db tokens create ai-interview-index     # -> DATABASE_AUTH_TOKEN
```

Set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `IP_HASH_SECRET` and optionally the
two Turnstile keys in the Vercel project, then `bun run db:push` and
`bun run db:seed` against the remote URL once.

## Rate limiter caveat

The limiter is in-process. That is correct on a single instance and leaky across
serverless instances; if traffic ever justifies it, move `hits` in
`src/lib/editor.ts` to Redis or Cloudflare KV.
