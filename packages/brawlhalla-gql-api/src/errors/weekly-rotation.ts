import { Schema } from "effect"

export class WeeklyRotationError extends Schema.TaggedErrorClass<WeeklyRotationError>()(
    "WeeklyRotationError",
    {
        message: Schema.optionalKey(Schema.String),
        cause: Schema.optionalKey(Schema.Unknown),
    },
) {}
