import type { WeeklyRotationSchema } from "@crh/api-contract/schemas"

export type RotationLegend = (typeof WeeklyRotationSchema.Type)[number]

export type RotationSlot = RotationLegend | null

/** The band is always nine tiles wide, whatever the rotation returns. */
export const ROTATION_SLOTS = 9

/** A fixed-length row of legends, with empty slots at the tail. */
export const rotationSlots = (
    rotation: readonly RotationLegend[],
    size = ROTATION_SLOTS,
): readonly RotationSlot[] =>
    Array.from({ length: size }, (_, index) => rotation[index] ?? null)
