import { logError, logInfo } from "logger"
import { startCrawler } from "./crawler"
import { startBot as startDiscordManagerBot } from "./appa-bot"

const __DEV = process.env.NODE_ENV === "development"

const crawlerMaxRequestsPer15Minutes = parseInt(
    process.env.CRAWLER_MAX_REQUESTS_PER_15_MINUTES || "100",
)

const crawlerMaxPages = parseInt(process.env.CRAWLER_MAX_PAGES || "100")

const main = async () => {
    await startDiscordManagerBot()

    const crawler = startCrawler(
        __DEV
            ? {
                  maxRequestsPer15Minutes: 300,
                  maxPages: 1,
              }
            : {
                  maxRequestsPer15Minutes: crawlerMaxRequestsPer15Minutes,
                  maxPages: crawlerMaxPages,
              },
    )
    logInfo("Crawler started")

    logInfo("All services started")

    await Promise.all([crawler]).catch((error) => {
        logError("Error in main", error)
    })
}

main()
