import { formatTime } from "common/helpers/date"
import { getPlayerStats, getRankings } from "bhapi"
import { logInfo, logWarning } from "logger"
import { Database, Effect, crawlProgress, eq, runDatabase } from "db/drizzle"
import { updateDBPlayerData } from "./updateDBPlayerData"
import type { RankedRegion } from "bhapi/constants"

type CrawlerConfig = {
    maxRequestsPer15Minutes: number
    maxPages: number
    startPage?: number
}

const defaultConfig: CrawlerConfig = {
    maxRequestsPer15Minutes: 100,
    maxPages: 3,
    startPage: 1,
}

const MAX_PLAYERS_PER_PAGE = 50
const ENABLED = process.env.CRAWLER_ENABLED === "true"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const requestWithMinimumDelay = async <T>(
    request: () => Promise<T>,
    delay: number,
): Promise<T> => {
    const [result] = await Promise.all([request(), sleep(delay)])
    return result
}

const sendRequestsWithRateLimit = async <T>(
    [request, ...rest]: (() => Promise<T>)[],
    delay: number,
): Promise<T[]> => {
    if (!request) return []
    const result = await requestWithMinimumDelay(request, delay)
    return [result, ...(await sendRequestsWithRateLimit(rest, delay))]
}

const createCrawlerQueue = async (config: CrawlerConfig) => {
    const delay = (15 * 60) / config.maxRequestsPer15Minutes
    const delayMs = delay * 1000
    const crawlDuration = delay * config.maxPages * (MAX_PLAYERS_PER_PAGE + 1)

    logInfo(
        `Crawl duration: ${crawlDuration} seconds (${formatTime(
            crawlDuration,
        )})`,
    )

    const requests = Array.from(
        { length: config.maxPages - (config.startPage ?? 1) + 1 },
        (_, i) => {
            return async () => {
                const currentPage = i + (config.startPage ?? 1)
                logInfo("Save crawl progress", currentPage)
                await runDatabase(
                    Effect.gen(function* () {
                        const db = yield* Database

                        yield* db
                            .insert(crawlProgress)
                            .values({
                                id: "Crawler",
                                progress: currentPage,
                                lastUpdated: new Date(),
                                name: "Crawler",
                            })
                            .onConflictDoUpdate({
                                target: crawlProgress.id,
                                set: {
                                    progress: currentPage,
                                    lastUpdated: new Date(),
                                    name: "Crawler",
                                },
                            })
                    }),
                )

                logInfo("Crawling leaderboard page", currentPage)
                const players = await requestWithMinimumDelay(
                    () => getRankings("1v1", "all", currentPage),
                    delayMs,
                )

                const playerRequests = players.map((player) => async () => {
                    logInfo(`Fetching player#${player.brawlhalla_id} stats`)
                    try {
                        const stats = await getPlayerStats(player.brawlhalla_id)

                        await updateDBPlayerData(stats, {
                            rating: player.rating,
                            peak: player.peak_rating,
                            games: player.games,
                            wins: player.wins,
                            tier: player.tier,
                            region: player.region.toLowerCase() as RankedRegion, // TODO: better type check
                        })

                        logInfo(`Fetched player#${player.brawlhalla_id} stats`)
                    } catch {
                        logInfo(
                            `Failed to fetch player#${player.brawlhalla_id} stats`,
                        )
                    }
                })

                await sendRequestsWithRateLimit(playerRequests, delayMs)
            }
        },
    )

    await sendRequestsWithRateLimit(requests, delayMs)
}

export const startCrawler = async (config: CrawlerConfig = defaultConfig) => {
    logInfo("Starting crawler")
    logInfo("Crawler enabled:", ENABLED)
    if (!ENABLED) {
        logWarning("Crawler disabled, exiting")
        return
    }

    let iteration = 0
    while (ENABLED) {
        iteration++
        await sleep(1000 * 30)
        let startPage = 1

        logInfo("Crawler iteration:", iteration)
        if (iteration === 1) {
            const progress = await runDatabase(
                Effect.gen(function* () {
                    const db = yield* Database

                    const rows = yield* db
                        .select()
                        .from(crawlProgress)
                        .where(eq(crawlProgress.id, "Crawler"))
                        .limit(1)

                    return rows[0] ?? null
                }),
            )

            // NOTE: ported verbatim from the Supabase query — the log message
            // and the early `return` on a found row are pre-existing behaviour.
            if (progress?.progress) {
                logWarning("Failed to fetch crawl progress")
                logInfo("Starting from page 1")

                startPage = progress.progress
                return
            }

            logInfo("Starting from page", startPage)
        }

        await createCrawlerQueue({
            ...config,
            startPage,
        })
    }
}
