import { companies, db, revisions } from './index'
import type { Policy } from './schema'
import { slugify } from '../lib/companies'

type Seed = {
  name: string
  policy: Policy
  process: string
  sourceUrl?: string
  sourceNote?: string
}

/**
 * Seeded from two places: companies that wrote publicly about their format, and
 * first-hand candidate reports from 2025-2026. Everything here is editable on the
 * site — this is a starting point, not a ruling.
 */
const SEED: Seed[] = [
  {
    name: 'Sierra',
    policy: 'ai_native',
    process:
      'Replaced coding and algorithm rounds with an AI-native onsite.\n\nCandidates scope a product, build it for roughly two hours with whatever tools they want, then review the product and the code with the interviewers.',
    sourceUrl: 'https://sierra.ai/blog/the-ai-native-interview',
    sourceNote: 'Sierra engineering blog, "The AI-native interview"',
  },
  {
    name: 'AngelList',
    policy: 'ai_native',
    process:
      'Candidates work in a real codebase and ship a pull request.\n\nAI is allowed throughout. Candidates have found data-loss bugs, improved tests, and shipped changes that were merged into production.',
    sourceUrl: 'https://www.angellist.com/blog/the-interview-that-ships-to-production',
    sourceNote: 'AngelList, "The Interview That Ships to Production"',
  },
  {
    name: 'Cerebras',
    policy: 'ai_native',
    process:
      'AI use is expected rather than tolerated.\n\nThe evaluation targets problem framing, verifying model output, and ownership of the result, not prompting tricks.',
    sourceUrl: 'https://www.cerebras.ai/blog/hiring-engineers-for-an-ai-native-world',
    sourceNote: 'Cerebras, "Hiring engineers for an AI-native world"',
  },
  {
    name: 'Cursor',
    policy: 'ai_native',
    process:
      'No traditional non-AI coding round.\n\nProcess is a career deep-dive, a system design round, and a project. Cursor has described a two-day onsite where candidates simulate building real products end to end in the codebase.',
    sourceUrl: 'https://sierra.ai/blog/the-ai-native-interview',
    sourceNote: 'Candidate report, 2026; format also described publicly by the CEO',
  },
  {
    name: 'Canva',
    policy: 'has_ai',
    process:
      'AI tools are permitted in interviews. Candidates are expected to explain and defend what the tools produced.',
    sourceUrl: 'https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/',
    sourceNote: 'Canva engineering blog, "Yes, you can use AI in our interviews"',
  },
  {
    name: 'Cognition',
    policy: 'no_ai',
    process:
      'First screen is a Python problem in CoderPad with no AI allowed.\n\nA later round is a one-hour project built in their own IDE.',
    sourceNote: 'Candidate report, 2025-2026',
  },
  {
    name: 'Ramp',
    policy: 'no_ai',
    process:
      'Full-stack coding screen plus questions on graph algorithms and HTTP fundamentals. No AI assistance.',
    sourceNote: 'Candidate report, Nov 2025',
  },
  {
    name: 'Pace',
    policy: 'no_ai',
    process: 'LeetCode-style screen. No AI assistance.',
    sourceNote: 'Candidate report, Nov 2025',
  },
]

async function main() {
  for (const s of SEED) {
    const slug = slugify(s.name)
    const existing = await db.select().from(companies).all()
    if (existing.some((c) => c.slug === slug)) {
      console.log(`skip  ${s.name}`)
      continue
    }
    const payload = {
      name: s.name,
      policy: s.policy,
      process: s.process,
      sourceUrl: s.sourceUrl ?? null,
      sourceNote: s.sourceNote ?? null,
    }
    const [created] = await db.insert(companies).values({ ...payload, slug }).returning()
    await db.insert(revisions).values({
      companyId: created.id,
      kind: 'create',
      before: null,
      after: JSON.stringify(payload),
      summary: 'seeded',
    })
    console.log(`added ${s.name}`)
  }
}

main()
