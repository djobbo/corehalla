import { formatTime } from "common/helpers/date"
import { getPlayerStats, getRankings } from "bhapi"
import { logInfo, logWarning } from "logger"
import { supabaseService } from "db/supabase/service"
import { updateDBPlayerData } from "db-utils/mutations/updateDBPlayerData"
import type { CrawlProgress } from "db/generated/client"
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
                logInfo("Crawling leaderboard page", i + 1)
                const players = await requestWithMinimumDelay(
                    () => getRankings("1v1", "all", i + 1),
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

    let iteration = 1
    while (ENABLED) {
        logInfo("Crawler iteration:", iteration)
        if (iteration === 1) {
            const { data, error } = await supabaseService
                .from<CrawlProgress>("CrawlProgress")
                .select("*")
                .match({ id: "Crawler" })
                .single()

            if (error || !data) {
                logWarning("Failed to fetch crawl progress")
                logInfo("Starting from page 1")

                await supabaseService
                    .from<CrawlProgress>("CrawlProgress")
                    .insert({ id: "Crawler", progress: 1 })

                await createCrawlerQueue({
                    ...config,
                    startPage: 1,
                })
                return
            }

            logInfo("Starting from page", data.progress)
            await createCrawlerQueue(config)
        } else {
            await createCrawlerQueue({
                ...config,
                startPage: 1,
            })
        }
        await sleep(1000 * 30)
        iteration++
    }
}
