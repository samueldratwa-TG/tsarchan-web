// Hosts. next.config.ts imports this module too, so it must stay free of imports.
// Domain migration sadot.click -> sadotlab.com, 2026-10-19
// (plan: C:\ClaudeProjects\domain-migration\MIGRATION.md).

/**
 * Canonical host: metadataBase, canonicals, the self-fetch in /api/hamadad and the "we moved"
 * banner use it. The same deployment also answers on hamadad-phi.vercel.app (never redirected).
 */
export const SITE_HOST = "hamadad.sadotlab.com";
export const SITE_URL = `https://${SITE_HOST}`;

/**
 * Previous custom domain. Stays attached to the Vercel project for the whole redirect lifetime
 * (at least until 2027-12-31); next.config.ts answers 308 to SITE_HOST with the path and query
 * kept and `moved=1` added.
 */
export const OLD_HOST = "hamadad.sadot.click";

/** The hub site (הצרחן הנבון - all the tools), linked from the footer. */
export const HUB_HOST = "sadotlab.com";
export const HUB_URL = `https://${HUB_HOST}`;
