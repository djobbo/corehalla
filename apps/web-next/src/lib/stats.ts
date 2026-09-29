/**
 * Guarded arithmetic for derived stats.
 *
 * A player profile is full of ratios whose denominator is legitimately zero — a
 * player with no ranked games, a legend never played, a weapon never held. The
 * legacy app divided directly and let `NaN` and `Infinity` reach the screen;
 * these helpers make the empty case an explicit `0` instead.
 */

export const ratio = (value: number, by: number, fallback = 0): number =>
    !Number.isFinite(by) || by === 0 ? fallback : value / by

/** A ratio expressed as a percentage. Callers format it. */
export const percent = (value: number, total: number): number =>
    ratio(value, total) * 100

/** `x` per game, for the per-game averages that litter the stat panels. */
export const perGame = (value: number, games: number): number =>
    ratio(value, games)
