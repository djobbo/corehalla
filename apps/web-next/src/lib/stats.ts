/** Zero denominators (unplayed legend/weapon) return `fallback`, not NaN. */
export const ratio = (value: number, by: number, fallback = 0): number =>
    !Number.isFinite(by) || by === 0 ? fallback : value / by

export const percent = (value: number, total: number): number =>
    ratio(value, total) * 100

export const perGame = (value: number, games: number): number =>
    ratio(value, games)
