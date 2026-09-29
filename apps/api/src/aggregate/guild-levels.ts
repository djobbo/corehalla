/**
 * Brawlhalla's guild level curve, taken from kubi.
 *
 * `guildLevels[i]` is the cumulative XP required to reach level `i + 1`, and
 * the values are the game's own thresholds rather than anything the API
 * reports — `/guild/stats` sends total XP and nothing about levelling, so the
 * level and the progress bar are derived here or not at all.
 */
const guildLevels = [0, 20_000, 200_000, 800_000, 2_000_000] as const

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

/**
 * The guild's level and how far it is through it, as a percentage.
 *
 * `findIndex` finds the first threshold at or above the guild's XP, so the
 * index is the *next* level's slot and the level itself is one below it. Two
 * inputs fall outside that reading and are handled explicitly:
 *
 * - Past the last threshold, `findIndex` is `-1`. The curve has no next slot,
 *   so the guild sits at the cap, level `guildLevels.length`, at `100%`.
 * - At zero XP the index is `0`, which has no previous slot to measure from.
 *   Kubi's original divides by that missing slot and reports the cap, which
 *   would put a brand-new guild at max level; this returns level 1 at `0%`
 *   instead.
 */
export const guildLevel = (
    guildXp: number,
): { readonly level: number; readonly xpPercentage: number } => {
    const index = guildLevels.findIndex((requiredXp) => requiredXp >= guildXp)

    if (index === -1) {
        return { level: guildLevels.length, xpPercentage: 100 }
    }

    if (index === 0) {
        return { level: 1, xpPercentage: 0 }
    }

    const currentLevelRequiredXp = guildLevels[index - 1] ?? 0
    const nextLevelRequiredXp = guildLevels[index] ?? currentLevelRequiredXp

    const span = nextLevelRequiredXp - currentLevelRequiredXp
    const xpPercentage =
        span <= 0
            ? 100
            : clamp((guildXp - currentLevelRequiredXp) / span, 0, 1) * 100

    return { level: index, xpPercentage }
}
