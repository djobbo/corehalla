/**
 * The colour roles a bar segment can carry.
 *
 * Named for the palette rather than for meaning, because the same six get used
 * two ways: semantically (wins are green, losses are orange) and as chart series
 * (a KO breakdown needs five colours that are merely distinct). A role name that
 * only described a mood would have to be invented again for the second case.
 *
 * Each maps to a single stylesheet class that sets `--ch-fill`; see the
 * `fill roles` block in `styles/app.css`.
 */
export type FillIntent =
    | "blue"
    | "cyan"
    | "green"
    | "orange"
    | "yellow"
    | "pink"

export const fillClass: Record<FillIntent, string> = {
    blue: "ch-fill-blue",
    cyan: "ch-fill-cyan",
    green: "ch-fill-green",
    orange: "ch-fill-orange",
    yellow: "ch-fill-yellow",
    pink: "ch-fill-pink",
}
