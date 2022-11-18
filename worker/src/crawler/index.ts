import { getPlayerStats, getRankings } from "bhapi"

type CrawlerConfig = {
    maxRequestsPer15Minutes: number
    maxPages: number
}

const defaultConfig: CrawlerConfig = {
    maxRequestsPer15Minutes: 5000,
    maxPages: 3,
}

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
    const delay = (15 * 60 * 1000) / config.maxRequestsPer15Minutes
    const requests = Array.from({ length: config.maxPages }).map((_, i) => {
        return async () => {
            console.log("Crawling leaderboard page", i + 1)
            const players = await requestWithMinimumDelay(
                () => getRankings("1v1", "all", i + 1),
                delay,
            )

            const playerRequests = players.map((player) => async () => {
                console.log(`Fetching player#${player.brawlhalla_id} stats`)
                try {
                    const stats = await getPlayerStats(
                        player.brawlhalla_id.toString(),
                    )
                    return {
                        ranked: player,
                        stats,
                    }
                } catch {
                    return {
                        ranked: player,
                    }
                }
            })
            const playerData = await sendRequestsWithRateLimit(
                playerRequests,
                delay,
            )
            return playerData
        }
    })
    const players = (await sendRequestsWithRateLimit(requests, delay)).flat(1)
    return players
}

export const startCrawler = async (config: CrawlerConfig = defaultConfig) => {
    const playerData = await createCrawlerQueue(config)
    console.log(
        playerData.map(({ stats }) => {
            if (!stats) return null
            return [
                stats.name,
                stats.legends.map((legend) => [
                    legend.legend_name_key,
                    legend.level,
                    legend.xp,
                ]),
            ]
        }),
    )
}
