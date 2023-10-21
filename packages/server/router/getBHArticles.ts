import {
    brawlhallaArticleCategorySchema,
    getBrawlhallaArticles,
} from "web-parser/common"
import { logInfo } from "logger"
import { publicProcedure } from "../trpc"
import { z } from "zod"

export const getBHArticles = publicProcedure //
    .input(
        z.object({
            category: brawlhallaArticleCategorySchema.default(""),
            first: z.number().min(1).default(1),
        }),
    )
    .query(async (req) => {
        const { category, first } = req.input
        logInfo("getBHArticles", { category, first })

        const articles = await getBrawlhallaArticles({
            category,
            first,
        })

        return articles
    })
