import { Context, Effect, Layer } from "effect"
import {
    getBrawlhallaArticles,
    getWeeklyRotation as getWeeklyRotationFn,
} from "@crh/web-parser/common"
import { ContentError } from "@crh/core/errors"
import type {
    BHArticle,
    BrawlhallaArticleCategory,
} from "@crh/web-parser/common"
import type { Legend } from "@crh/bhapi/types"

export class Content extends Context.Service<
    Content,
    {
        readonly getWeeklyRotation: () => Effect.Effect<readonly Legend[]>
        readonly getArticles: (
            category: BrawlhallaArticleCategory,
            first: number,
        ) => Effect.Effect<readonly BHArticle[]>
    }
>()("app/Content") {}

const run = <A>(f: () => Promise<A>) =>
    Effect.tryPromise({
        try: f,
        catch: (cause) => new ContentError({ cause }),
    }).pipe(Effect.orDie)

export const layer = Layer.succeed(Content, {
    getWeeklyRotation: () => run(() => getWeeklyRotationFn()),

    getArticles: (category, first) =>
        run(() => getBrawlhallaArticles({ category, first })),
})
