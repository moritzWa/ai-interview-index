/** Canonical origin. Netlify sets URL to the production domain at build time. */
export const SITE_URL = (process.env.SITE_URL ?? process.env.URL ?? 'https://aiinterviewindex.com')
  .replace(/\/$/, '')
