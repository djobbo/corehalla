import { cleanString } from "common/helpers/cleanString"
import { Schema, SchemaTransformation } from "effect"

export const BrawlhallaId = Schema.Number

export const BrawlhallaName = Schema.String.pipe(
    Schema.decode(
        SchemaTransformation.transform({
            decode: (name) => cleanString(name),
            encode: (name) => name,
        }),
    ),
)
