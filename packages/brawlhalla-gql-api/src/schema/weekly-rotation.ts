import { Schema } from "effect"

export const WeeklyRotationLegend = Schema.Struct({
    id: Schema.Number,
    name_key: Schema.String,
    name: Schema.String,
})

export const WeeklyRotation = Schema.Array(WeeklyRotationLegend)

export type WeeklyRotationLegend = typeof WeeklyRotationLegend.Type
export type WeeklyRotation = typeof WeeklyRotation.Type
