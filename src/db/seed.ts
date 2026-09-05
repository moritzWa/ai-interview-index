import { companies, db, revisions } from './index'
import type { Policy } from './schema'
import { slugify } from '../lib/companies'

type Seed = {
  name: string
  policy: Policy
  process: string
  sourceUrl?: string
  sourceNote?: string
  resources?: { url: string; title: string }[]
  website?: string
  city?: string
  industry?: string
}

/** Generated from the live database. */
const SEED: Seed[] = [
  {
    name: "AngelList",
    policy: "ai_native",
    process: "Candidates work in a real codebase and ship a pull request.\n\nAI is allowed throughout. Candidates have found data-loss bugs, improved tests, and shipped changes that were merged into production.",
    sourceUrl: "https://www.angellist.com/blog/the-interview-that-ships-to-production",
    sourceNote: "AngelList, \"The Interview That Ships to Production\"",
    website: "https://www.angellist.com",
    city: "San Francisco",
    industry: "Fintech",
    resources: [
      { url: "https://www.angellist.com/blog/the-interview-that-ships-to-production", title: "The Interview That Ships to Production" },
    ],
  },
  {
    name: "Anthropic",
    policy: "has_ai",
    process: "Live interviews are AI-free unless stated; some take-homes explicitly allow it.\n\nThe documented exception is the performance-engineering take-home, which permits AI on the reasoning that a long-horizon optimisation problem still differentiates people who use it the way they would on the job. Prep with Claude is encouraged.",
    sourceNote: "Candidate AI guidance and engineering blog",
    website: "https://www.anthropic.com",
    city: "San Francisco",
    industry: "AI research",
    resources: [
      { url: "https://www.anthropic.com/candidate-ai-guidance", title: "Candidate AI guidance" },
      { url: "https://www.anthropic.com/engineering/AI-resistant-technical-evaluations", title: "AI-resistant technical evaluations" },
    ],
  },
  {
    name: "Arca",
    policy: "ai_native",
    process: "No traditional coding interview: paid contracting, then a work trial, then an offer.\n\nAI tooling is assumed throughout, because it is how the team works day to day.",
    sourceNote: "Candidate report, Aug 2026",
    website: "https://arca.inc",
    city: "New York",
    industry: "Legal AI",
  },
  {
    name: "Augustus",
    policy: "no_ai",
    process: "No coding interview at all, in practice.\n\nThe screen was originally a 1h remote pair-programming round in TypeScript, algorithmic, no AI. A candidate pushed back on the no-AI constraint and they dropped the coding round entirely, replacing it with a practical system design conversation about past work. That loop ended in an offer.",
    sourceNote: "Candidate report, Aug 2026",
    website: "https://augustus.com/",
    city: "New York",
    industry: "Fintech",
  },
  {
    name: "Automattic",
    policy: "has_ai",
    process: "No whiteboard: a take-home with your own tools, then a paid trial.\n\nAI is allowed on work product, but you must disclose which tools you used, when, how, and how you evaluated the output. Using it to generate answers to interview questions is not allowed.",
    sourceNote: "Public hiring pages",
    website: "https://automattic.com",
    city: "Remote",
    industry: "Web publishing",
    resources: [
      { url: "https://automattic.com/work-with-us/how-we-hire-developers/", title: "How we hire developers" },
      { url: "https://automattic.com/what-to-expect-during-a-trial/", title: "What to expect during a trial" },
    ],
  },
  {
    name: "Canva",
    policy: "has_ai",
    process: "AI tools are permitted in interviews, and you are expected to defend what they produced.",
    sourceUrl: "https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/",
    sourceNote: "Canva engineering blog, \"Yes, you can use AI in our interviews\"",
    website: "https://www.canva.com",
    city: "Sydney",
    industry: "Design",
    resources: [
      { url: "https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/", title: "Yes, you can use AI in our interviews" },
    ],
  },
  {
    name: "Cerebras",
    policy: "ai_native",
    process: "AI use is expected rather than tolerated.\n\nThe evaluation targets problem framing, verifying model output, and ownership of the result, not prompting tricks.",
    sourceUrl: "https://www.cerebras.ai/blog/hiring-engineers-for-an-ai-native-world",
    sourceNote: "Cerebras, \"Hiring engineers for an AI-native world\"",
    website: "https://www.cerebras.ai",
    city: "Sunnyvale",
    industry: "AI hardware",
    resources: [
      { url: "https://www.cerebras.ai/blog/hiring-engineers-for-an-ai-native-world", title: "Hiring engineers for an AI-native world" },
    ],
  },
  {
    name: "Cognition",
    policy: "no_ai",
    process: "Self-serve CoderPad assessment as step one, roughly 1-1.5 hours, no AI allowed.\n\nThe follow-up round is a Python debugging interview.",
    sourceNote: "Recruiter email, Aug 2026",
    website: "https://cognition.ai",
    city: "San Francisco",
    industry: "Dev tools",
  },
  {
    name: "Coinbase",
    policy: "ai_native",
    process: "Rebuilt its questions after the old ones proved solvable with AI switched on.\n\nFrontend questions now hand candidates AI tools and score prompt quality, evaluation of the output, error catching and iteration. Backend uses custom repository-based questions covering debugging, review and rollback reasoning, with AI available. They describe collecting AI signals at every stage of the loop.",
    sourceNote: "Engineering blog, Mar 2026",
    website: "https://www.coinbase.com",
    city: "Remote",
    industry: "Crypto exchange",
    resources: [
      { url: "https://www.coinbase.com/blog/interviewing-engineers-in-the-ai-era-lessons-from-a-year-of-rebuilding", title: "Interviewing engineers in the AI era" },
    ],
  },
  {
    name: "Convex",
    policy: "no_ai",
    process: "Keeps AI out deliberately: interviews should measure thinking, not simulate the job.\n\nRoughly seven conversations including two phone-screen coding rounds and two onsite coding rounds, several at a whiteboard with no computer. There is neither an AI mandate nor a ban on the job. They rejected work trials for senior hires as too short to reveal judgement.",
    sourceNote: "CTO interview on the Convex blog, 2026",
    website: "https://www.convex.dev",
    city: "San Francisco",
    industry: "Backend platform",
    resources: [
      { url: "https://stack.convex.dev/should-ai-be-used-in-coding-interviews", title: "Should AI be used in coding interviews?" },
    ],
  },
  {
    name: "Crosby",
    policy: "has_ai",
    process: "Two coding rounds the same day: one with AI switched off, one AI-assisted.\n\nThe AI-assisted round is only partly that in practice. One candidate was asked mid-round to stop using AI and read back the code it had generated unaided. The rest of the onsite is a hiring manager screen, a project deep dive, and conversational rounds.",
    sourceNote: "Candidate report, onsite Aug 2026",
    website: "https://www.crosby.ai",
    city: "New York",
    industry: "Legal AI",
  },
  {
    name: "Cursor",
    policy: "ai_native",
    process: "No non-AI coding round in the loop.\n\nRecruiter screen, then three rounds: 60min systems design on a whiteboard, 45min technical deep dive on prior work, and a 45min career walkthrough. The recruiter described the technical portion as work-sample rather than pure algorithms.",
    sourceNote: "Candidate report, Aug 2026",
    website: "https://cursor.com",
    city: "San Francisco",
    industry: "Dev tools",
  },
  {
    name: "Datadog",
    policy: "has_ai",
    process: "Live coding is AI-free by default, but some roles get a designated AI-assisted round.\n\nWhere that round exists, AI is allowed and expected, and you are scored on how you leverage it; candidates are told in advance. Take-homes permit AI for research but the submitted work must be yours and you should expect to defend it live. Misuse or non-disclosure can disqualify.",
    sourceNote: "Careers site AI guidelines, May 2026",
    website: "https://www.datadoghq.com",
    city: "New York",
    industry: "Observability",
    resources: [
      { url: "https://careers.datadoghq.com/candidate-experience/interviewing-at-datadog-ai-guidelines/", title: "Interviewing at Datadog: AI guidelines" },
    ],
  },
  {
    name: "DigitalOcean",
    policy: "ai_native",
    process: "Replaced the phone screen and algorithm onsite with a three-hour build using any AI.\n\nCandidates pick a prompt, then design, build and deploy a working prototype, followed by a walkthrough of trade-offs, scale and business constraints. Documented for a Seattle cohort that hired 33 engineers in two weeks, described as one they plan to repeat rather than a company-wide default.",
    sourceNote: "Engineering blog, Jun 2026",
    website: "https://www.digitalocean.com",
    city: "New York",
    industry: "Cloud infrastructure",
    resources: [
      { url: "https://www.digitalocean.com/blog/ai-native-engineering-interview", title: "What we learned hiring 33 engineers in two weeks" },
    ],
  },
  {
    name: "GitLab",
    policy: "has_ai",
    process: "The handbook states plainly that AI use is encouraged in the interview process.\n\nThe technical interview is an async review of a self-contained merge request sent at least 72 hours ahead, then a 90-minute screen share walking through that review and writing code to improve it. A Duo-native loop is in design but is not the handbook default.",
    sourceNote: "Public handbook, updated Aug 2026",
    website: "https://about.gitlab.com",
    city: "Remote",
    industry: "DevSecOps",
    resources: [
      { url: "https://handbook.gitlab.com/handbook/hiring/interviewing/technical/", title: "Technical interviewing handbook" },
    ],
  },
  {
    name: "Hanover Park",
    policy: "ai_native",
    process: "Issue triage on a real codebase under time pressure, salted with issues that are not real.\n\nAI is assumed. The signal is what you choose to fix and what you correctly ignore.",
    sourceNote: "Candidate report, Aug 2026",
    website: "https://www.hanoverpark.com",
    city: "New York",
    industry: "Fund administration",
  },
  {
    name: "Kogan.com",
    policy: "ai_native",
    process: "Asks candidates to bring Cursor, Claude, ChatGPT or Copilot to the interview.\n\nYou screen-share and talk through it like a pull-request walkthrough, in any language or stack. Using AI does not count against you; blindly trusting it does, and \"the AI wrote it\" is not an accepted answer.",
    sourceNote: "Dev blog, May 2026",
    website: "https://www.kogan.com",
    city: "Melbourne",
    industry: "E-commerce",
    resources: [
      { url: "https://devblog.kogan.com/blog/use-ai-in-your-kogan-interview-we-would-rather-you-did", title: "Use AI in your Kogan interview, we would rather you did" },
    ],
  },
  {
    name: "Longlake",
    policy: "has_ai",
    process: "One round allows AI and a separate round does not, run as two different signals.\n\nAlso a behavioral round and a case study: propose an acquisition and defend it.",
    sourceNote: "Second-hand report from a contractor, 2026",
    website: "https://llmh.com/",
    city: "New York",
    industry: "Private equity",
  },
  {
    name: "Mirakl",
    policy: "no_ai",
    process: "AI is prohibited by default in technical assessments.",
    sourceUrl: "https://www.mirakl.com/company/careers/",
    sourceNote: "Mirakl careers page",
    website: "https://www.mirakl.com",
    city: "Paris",
    industry: "E-commerce",
    resources: [
      { url: "https://www.mirakl.com/company/careers/", title: "Careers page: assessment policy" },
    ],
  },
  {
    name: "Omnea",
    policy: "has_ai",
    process: "Pair programming on a realistic problem, with any AI tooling allowed and none required.\n\nThey have seen both fully unaided and fully agent-written solutions succeed on the same problem. Scoring is on problem breakdown, review of the AI's output, iteration and verification. One round for everyone rather than a split loop.",
    sourceNote: "Engineering blog, May 2026",
    website: "https://www.omnea.co",
    city: "London",
    industry: "Procurement",
    resources: [
      { url: "https://www.omnea.co/resource/ai-in-our-programming-interviews", title: "AI in our programming interviews" },
    ],
  },
  {
    name: "OpenAI",
    policy: "no_ai",
    process: "AI is off by default in the interview, and permitted only where a specific round says otherwise.\n\nTheir published guide states that expectations vary by interview and that candidates are told in the preparation materials what is allowed. Reports of the engineering loop describe conventional algorithm-heavy screens.",
    sourceNote: "OpenAI interview guide, plus candidate reports",
    website: "https://openai.com",
    city: "San Francisco",
    industry: "AI research",
    resources: [
      { url: "https://openai.com/interview-guide/", title: "OpenAI interview guide" },
    ],
  },
  {
    name: "OpenEvidence",
    policy: "no_ai",
    process: "One-hour LeetCode-style coding interview after the recruiter call.",
    sourceNote: "Recruiter email, Aug 2026",
    website: "https://www.openevidence.com",
    city: "Boston",
    industry: "Health AI",
  },
  {
    name: "Pace",
    policy: "no_ai",
    process: "LeetCode-style screen. No AI assistance.",
    sourceNote: "Candidate report, Nov 2025",
    website: "https://withpace.com/",
    city: "New York",
    industry: "Fintech",
  },
  {
    name: "Plasmidsaurus",
    policy: "has_ai",
    process: "A one-hour realistic build where AI, Google and pairing are all encouraged.\n\nCandidates get a business problem, API docs and credentials, and are expected to produce a working script that talks to a database and a third-party API, with tests. Their framing is that using AI raises the bar rather than lowering it.",
    sourceNote: "Hiring engineer's blog, Mar 2026",
    website: "https://www.plasmidsaurus.com",
    city: "South San Francisco",
    industry: "DNA sequencing",
    resources: [
      { url: "https://swizec.com/blog/software-engineer-interviews-for-the-age-of-ai", title: "Software engineer interviews for the age of AI" },
    ],
  },
  {
    name: "Poetic",
    policy: "no_ai",
    process: "A 45-minute practical programming problem, explicitly not algorithmic, in any language.\n\nThe recruiter's framing: no LLMs allowed for most of it, though you can search for language documentation.",
    sourceNote: "Recruiter email, Jul 2026",
    website: "https://poetic.com",
    city: "New York",
    industry: "AI agents",
  },
  {
    name: "PostHog",
    policy: "has_ai",
    process: "Splits the signal: a paid project day with AI, and a debugging round without it.\n\nAfter two or three short interviews with no live coding, the final stage is a paid SuperDay ($1,000). The main project is built from scratch with AI allowed, and the candidate defends the architecture. The 45-minute pairing session on an unfamiliar codebase permits Google but no AI beyond basic autocomplete.",
    sourceNote: "Public engineering handbook",
    website: "https://posthog.com",
    city: "Remote",
    industry: "Product analytics",
    resources: [
      { url: "https://posthog.com/handbook/people/hiring-process/engineering-superday", title: "Engineering SuperDay" },
      { url: "https://posthog.com/handbook/people/hiring-process", title: "Hiring process" },
    ],
  },
  {
    name: "Qualified",
    policy: "ai_native",
    process: "Candidates get an agent and a real system, and use AI however they see fit.\n\nWhat scores well is directing agents, specifying before delegating, and discovery under ambiguity; shipping agent output without understanding it is the red flag. Described by the Head of Engineering; the company has since been acquired by Salesforce.",
    sourceNote: "Head of Engineering, LinkedIn 2026",
    website: "https://www.qualified.com",
    city: "San Francisco",
    industry: "AI sales agents",
    resources: [
      { url: "https://www.linkedin.com/posts/jason-mattiace_we-let-candidates-use-ai-in-our-coding-interviews-activity-7467604679913275392-2Vic", title: "We let candidates use AI in our coding interviews" },
    ],
  },
  {
    name: "Ramp",
    policy: "no_ai",
    process: "Full-stack coding screen plus graph algorithm and HTTP questions. No AI.",
    sourceNote: "Candidate report, Nov 2025",
    website: "https://ramp.com",
    city: "New York",
    industry: "Fintech",
  },
  {
    name: "Rogo",
    policy: "no_ai",
    process: "No round in the engineering loop lets candidates use AI.\n\nRaised internally as a question in early 2026 and argued down: the position that carried was that interviews should test how someone reasons through a hard problem unaided, and that learning the tools is trivial enough not to be worth selecting for.",
    sourceNote: "Internal discussion, Jan 2026",
    website: "https://rogodata.com",
    city: "New York",
    industry: "Finance AI",
  },
  {
    name: "SageOx",
    policy: "ai_native",
    process: "No technical interviews. Candidates do a three to five day in-person work trial.\n\nThe hiring bar explicitly includes agentic coding as a requirement. Whether the trial is paid is argued for in the post but not stated outright, and the sample so far is small.",
    sourceNote: "Founder blog, Jun 2026",
    website: "https://sageox.ai",
    city: "Seattle",
    industry: "AI agent teams",
    resources: [
      { url: "https://sageox.ai/blog/rip-tech-interviews", title: "RIP tech interviews" },
    ],
  },
  {
    name: "Sendbird",
    policy: "no_ai",
    process: "AI is prohibited by default in technical assessments.",
    sourceUrl: "https://sendbird.com/careers/candidate-experience",
    sourceNote: "Sendbird candidate experience page",
    website: "https://sendbird.com",
    city: "San Francisco",
    industry: "Developer APIs",
    resources: [
      { url: "https://sendbird.com/careers/candidate-experience", title: "Candidate experience: AI use policy" },
    ],
  },
  {
    name: "Sierra",
    policy: "ai_native",
    process: "Replaced coding and algorithm rounds with an AI-native onsite.\n\nCandidates scope a product, build it for roughly two hours with whatever tools they want, then review the product and the code with the interviewers.",
    sourceUrl: "https://sierra.ai/blog/the-ai-native-interview",
    sourceNote: "Sierra engineering blog, \"The AI-native interview\"",
    website: "https://sierra.ai",
    city: "San Francisco",
    industry: "AI agents",
    resources: [
      { url: "https://sierra.ai/blog/the-ai-native-interview", title: "The AI-native interview" },
    ],
  },
  {
    name: "Sonar",
    policy: "has_ai",
    process: "Published per-round rules: AI is banned in some rounds and expected in others.\n\nPre-screen coding tests prohibit AI. The hiring-manager interview includes a simple unaided problem. The technical interview expects you to use AI to move fast, scored on how you validate and control its output. Cross-functional and final rounds do not permit it on the call.",
    sourceNote: "Official candidate AI guidelines",
    website: "https://www.sonarsource.com",
    city: "Geneva",
    industry: "Code quality",
    resources: [
      { url: "https://www.sonarsource.com/legal/ai-use-guidelines-for-interviewing/", title: "AI use guidelines for interviewing" },
    ],
  },
  {
    name: "Warp",
    policy: "ai_native",
    process: "One hour building a real feature, with any agent fair game.\n\nScoring is on judgement: modelling the problem before accelerating, rather than prompting and accepting. This replaced an earlier format: in Oct 2025 the first technical round was a 45-60 minute DSA-style question drawn from the Warp payroll codebase, live with the CTO, with no stated AI policy. The current format is described by the CEO in mid-2026.",
    sourceNote: "CEO tweet and Fast Company piece, 2026; earlier format from a recruiter email, Oct 2025",
    website: "https://www.warp.co",
    city: "New York",
    industry: "Payroll and HR",
    resources: [
      { url: "https://x.com/ayushswrites/status/2061843857990418915", title: "CEO on letting candidates use AI" },
      { url: "https://www.fastcompany.com/91573546/we-let-job-candidates-use-ai-it-made-hiring-better", title: "We let job candidates use AI. It made hiring better." },
    ],
  },
  {
    name: "Wrike",
    policy: "has_ai",
    process: "Split by design: a whiteboard round with no AI, then implementation with any AI.\n\nThe first part is a human conversation about ambiguous requirements and a high-level approach. The second is implementation on the candidate's own machine over screen share, with any tools or none. They score whether you can walk through and defend the code, not how it was typed. They used to ban AI and try to catch it, and stopped.",
    sourceNote: "Wrike Tech Club, Jul 2026",
    website: "https://www.wrike.com",
    city: "San Diego",
    industry: "Work management",
    resources: [
      { url: "https://medium.com/wriketechclub/the-ai-interview-use-it-own-it-7ec317f2789e", title: "The AI interview: use it, own it" },
    ],
  },
  {
    name: "Zapier",
    policy: "ai_native",
    process: "An AI-fluency bar applies at every stage, from application to executive interview.\n\nThe revamped skills tests watch candidates work with AI in real time: how they prompt, push back and adapt. The engineering skills test is a take-home simulating real work, with any resources you would use on the job. The fluency rubric is better documented than the round-by-round coding format.",
    sourceNote: "Jobs site and talent blog",
    website: "https://zapier.com",
    city: "Remote",
    industry: "Automation",
    resources: [
      { url: "https://zapier.com/l/jobs/ai-at-zapier", title: "AI at Zapier" },
      { url: "https://zapier.com/blog/raising-ai-fluency-bar-in-hiring/", title: "Raising the AI fluency bar in hiring" },
    ],
  },
]

async function main() {
  for (const s of SEED) {
    const slug = slugify(s.name)
    const existing = await db.select().from(companies)
    if (existing.some((c) => c.slug === slug)) { console.log(`skip  ${s.name}`); continue }
    const payload = {
      name: s.name, policy: s.policy, process: s.process,
      sourceUrl: s.sourceUrl ?? null, sourceNote: s.sourceNote ?? null,
      resources: s.resources ? JSON.stringify(s.resources) : null,
      website: s.website ?? null, city: s.city ?? null, industry: s.industry ?? null,
    }
    const [created] = await db.insert(companies).values({ ...payload, slug }).returning()
    await db.insert(revisions).values({
      companyId: created.id, kind: 'create', before: null,
      after: JSON.stringify(payload), summary: 'seeded',
    })
    console.log(`added ${s.name}`)
  }
}

main()
