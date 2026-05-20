import { Schema } from "effect"

export const Legend = Schema.Struct({
    legend_id: Schema.Number,
    legend_name_key: Schema.String,
    bio_name: Schema.String,
    bio_aka: Schema.String,
    weapon_one: Schema.String,
    weapon_two: Schema.String,
    strength: Schema.String,
    dexterity: Schema.String,
    defense: Schema.String,
    speed: Schema.String,
})

export const Legends = Schema.Array(Legend)

export type Legend = typeof Legend.Type
