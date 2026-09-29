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
