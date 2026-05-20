import { legends } from "bhapi/legends"
import { load as loadHtml } from "cheerio"
import * as Effect from "effect/Effect"

import { WeeklyRotationError } from "../errors/weekly-rotation.js"
import type { WeeklyRotation } from "../schema/weekly-rotation.js"

export const parseWeeklyRotation = Effect.fn("parseWeeklyRotation")(function* (
    content?: string,
) {
    if (!content) {
        return yield* Effect.fail(
            new WeeklyRotationError({ message: "Content not found" }),
        )
    }

    const $ = loadHtml(content)

    const legendsList = $("p + ul")
        .filter((_, element) => {
            const el = $(element)
            const paragraphText = el.prev("p").text().toLowerCase()
            return paragraphText.includes("free-to-play legend rotation")
        })
        .first()

    if (legendsList.length < 1) {
        return yield* Effect.fail(
            new WeeklyRotationError({ message: "Legend list not found" }),
        )
    }

    const weeklyRotation = legendsList
        .find("li")
        .map((_, element) => {
            const text = $(element).text()
            const legendName = text.split(" – ")[0]
            return legends.find((legend) => legend.bio_name === legendName)
        })
        .get()
        .filter(
            (legend): legend is NonNullable<typeof legend> =>
                legend !== undefined,
        )

    return weeklyRotation.map((legend): WeeklyRotation[number] => ({
        id: legend.legend_id,
        name_key: legend.legend_name_key,
        name: legend.bio_name,
    }))
})
