import { logInfo } from "logger"
import {
    brawlhallaArticleCategorySchema,
    getBrawlhallaArticles,
} from "web-parser/common"
import { z } from "zod"

import { publicProcedure } from "../trpc"

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
