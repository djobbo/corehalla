import { Schema } from "effect"

export const PostsVariables = Schema.Struct({
    first: Schema.optionalKey(Schema.Number),
    category: Schema.optionalKey(Schema.String),
    after: Schema.optionalKey(Schema.String),
})

export type PostsVariables = typeof PostsVariables.Type
