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
      'No non-AI coding round in the loop.\n\nRecruiter screen, then three rounds: 60min systems design on a whiteboard, 45min technical deep dive on prior work, and a 45min career walkthrough. The recruiter described the technical portion as work-sample rather than pure algorithms.',
    sourceNote: 'Candidate report, Aug 2026',
  },
  {
    name: 'Crosby',
    policy: 'has_ai',
    process:
      'Splits the signals explicitly: two separate coding rounds on the same day.\n\nA 1h "Backend Build" in CoderPad with AI switched off, and a 1h "AI-Assisted Interview" where using it is the point. The rest of the onsite is a hiring manager screen, a project deep dive, and conversational rounds.',
    sourceNote: 'Candidate report, onsite Aug 2026',
  },
  {
    name: 'Longlake',
    policy: 'has_ai',
    process:
      'One round where AI is allowed and a separate round where it is not, deliberately run as two different signals.\n\nAlso a behavioral round and a case study: propose an acquisition and defend it.',
    sourceNote: 'Second-hand report from a contractor, 2026',
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
      'Self-serve CoderPad assessment as step one, roughly 1-1.5 hours, no AI allowed.\n\nThe follow-up round is a Python debugging interview.',
    sourceNote: 'Recruiter email, Aug 2026',
  },
  {
    name: 'Poetic',
    policy: 'no_ai',
    process:
      'A 45-minute practical programming problem, explicitly not algorithmic, in any language.\n\nThe recruiter\'s framing: no LLMs allowed for most of it, though you can search for language documentation.',
    sourceNote: 'Recruiter email, Jul 2026',
  },
  {
    name: 'Augustus',
    policy: 'no_ai',
    process:
      'The screen was a 1h remote pair-programming round in TypeScript, algorithmic, no AI.\n\nOne candidate pushed back on the no-AI constraint and they dropped the coding round entirely, substituting a practical system design conversation about past work. So the default is no AI, but it has been negotiated.',
    sourceNote: 'Candidate report, Aug 2026',
  },
  {
    name: 'OpenEvidence',
    policy: 'no_ai',
    process: 'One-hour LeetCode-style coding interview after the recruiter call.',
    sourceNote: 'Recruiter email, Aug 2026',
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
  {
    name: 'Sendbird',
    policy: 'no_ai',
    process: 'AI use is prohibited by default in technical assessments, per their published candidate policy.',
    sourceUrl: 'https://sendbird.com/careers/candidate-experience',
    sourceNote: 'Sendbird candidate experience page',
  },
  {
    name: 'Mirakl',
    policy: 'no_ai',
    process: 'AI use is prohibited by default in technical assessments, per their published careers policy.',
    sourceUrl: 'https://www.mirakl.com/company/careers/',
    sourceNote: 'Mirakl careers page',
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
