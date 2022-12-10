import {
    bhArticleTypeValidator,
    parseBHArticlesPage,
} from "web-parser/bh-articles/parseBHArticlesPage"
import { logInfo } from "logger"
import { numericLiteralValidator } from "common/helpers/validators"
import { publicProcedure } from "@server/trpc"
import { z } from "zod"

export const getBHArticles = publicProcedure //
    .input(
        z.object({
            page: numericLiteralValidator,
            type: bhArticleTypeValidator,
            max: z.optional(z.number().min(1)),
        }),
    )
    .query(async (req) => {
        const { page, type, max } = req.input
        logInfo("getBHArticles", { page, type, max })

        const articles = await parseBHArticlesPage(page, type)

        if (max) {
            return articles.slice(0, parseInt(max.toString()))
        }

        return articles
    })
