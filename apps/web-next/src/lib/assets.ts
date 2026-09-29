/**
 * Where the bundled Brawlhalla art lives.
 *
 * These are runtime URLs, not module imports: the images are served as-is from
 * `publicDir` (see `vite.config.ts`) rather than run through the bundler, so
 * there is nothing for Vite to resolve and no hashed filename to track.
 *
 * One helper per asset family, because each family has its own key shape —
 * legend icons are keyed by `legend_name_key`, weapon icons by display name,
 * region flags by upper-cased region code — and spreading that knowledge across
 * call sites is how a path quietly drifts.
 */

export const legendIconSrc = (legendNameKey: string): string =>
    `/images/icons/roster/legends/${legendNameKey}.png`

/** Weapon names carry spaces, so the segment is encoded. */
export const weaponIconSrc = (weapon: string): string =>
    `/images/icons/weapons/${encodeURIComponent(weapon)}.png`

/**
 * Flag files are upper-cased. The API sends the region in either case — the
 * ranked payload uses lower-case codes, the ladders upper-case ones — so
 * normalising here is what keeps one helper correct for both.
 */
export const regionFlagSrc = (region: string): string =>
    `/images/icons/flags/${region.toUpperCase()}.png`

/**
 * Ranked banners are named after the tier, with one wrinkle worth naming: the
 * API reports Valhallan as `null`, and the asset set ships a byte-identical
 * `null.png` alongside `Valhallan.png` so that a naive template string still
 * resolves. Mapping the null to the real tier here means we depend on the
 * meaning rather than on that alias continuing to exist.
 */
export const rankedBannerSrc = (tier: string | null | undefined): string =>
    `/images/ranked-banners/${tier ?? "Valhallan"}.png`
