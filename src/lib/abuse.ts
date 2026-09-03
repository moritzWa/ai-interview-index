import type { Editable } from './companies'

/**
 * Wikipedia-style edit filter. Rate limits cap how *many* edits land; these rules
 * cap how much damage one edit can do. The bias is deliberate: refuse the shapes
 * that vandalism takes, and let anything ambiguous through, because a wrong edit is
 * cheap to revert and a wrongly-blocked contributor is gone for good.
 */

const LINK = /https?:\/\/\S+/g

export function screenEdit(before: Editable | null, after: Editable): string | null {
  // Blanking. The classic vandalism shape: replace real content with nothing or
  // with a token character so the field passes a "non-empty" check.
  if (before && before.process.length > 80 && after.process.trim().length < 20) {
    return 'That empties the process description. Edit the text instead of clearing it, or say what is wrong in the source note.'
  }

  // Mass removal. Wikipedia flags edits that strip most of a section; anything
  // legitimate at this size is a rewrite, which will still be over the floor.
  if (before && before.process.length > 200 && after.process.length < before.process.length * 0.25) {
    return 'That removes most of the existing description. If it is wrong, rewrite it rather than deleting it.'
  }

  // Link spam. A directory entry needs a source, not a listicle.
  const links = after.process.match(LINK)?.length ?? 0
  if (links > 2) return 'Too many links in the description. Put the source in the source field.'

  // Filler and keyboard mashing: one character repeated, or no whitespace at all
  // across a long run, which no real sentence does.
  if (/(.)\1{9,}/.test(after.process) || /\S{60,}/.test(after.process)) {
    return 'That does not look like a description of an interview process.'
  }

  // Name churn. Renaming an existing company is almost never a real edit, and it
  // is how one entry gets turned into an impersonation of another.
  if (before && before.name !== after.name && before.name.toLowerCase() !== after.name.toLowerCase()) {
    return 'Company names cannot be changed here. Add a new entry if this is a different company.'
  }

  return null
}

/** Bots fill every field they find; people never see this one. */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  return typeof body.url === 'string' && body.url.trim().length > 0
}
