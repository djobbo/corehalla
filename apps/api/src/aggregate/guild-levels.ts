// `guildLevels[i]` is cumulative XP to reach level `i + 1` (game thresholds; API sends XP only).
const guildLevels = [0, 20_000, 200_000, 800_000, 2_000_000] as const

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max)

/**
 * `findIndex` is the next threshold. Past the last → cap at 100%. Index 0 (zero XP)
 * has no previous slot — return level 1 at 0%, not the cap.
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
