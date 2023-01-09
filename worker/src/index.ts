import { config as loadEnv } from "dotenv"
import { logError, logInfo } from "logger"
import { startCrawler } from "./crawler"
import { startBot as startDiscordManagerBot } from "./appa-bot"
import { z } from "zod"

loadEnv()

const __DEV = process.env.NODE_ENV === "development"

const crawlerMaxRequestsPer15Minutes = parseInt(
    process.env.CRAWLER_MAX_REQUESTS_PER_15_MINUTES || "100",
)

const crawlerMaxPages = parseInt(process.env.CRAWLER_MAX_PAGES || "100")

const main = async () => {
    const {
        DISCORD_MANAGER_BOT_ENABLED = "false",
        DISCORD_MANAGER_BOT_TOKEN,
        DISCORD_MANAGER_BOT_DEV_GUILD_ID,
        DISCORD_MANAGER_BOT_CLIENT_ID,
        DISCORD_CHANNEL_SWITCHER_VOICE_LOGS_CHANNEL_ID,
        DISCORD_CHANNEL_SWITCHER_GENERATOR_CATEGORY_ID,
        DISCORD_CHANNEL_SWITCHER_LOBBYS_CATEGORY_ID,
    } = process.env

    await startDiscordManagerBot({
        enabled: DISCORD_MANAGER_BOT_ENABLED === "true",
        token: z.string().min(1).parse(DISCORD_MANAGER_BOT_TOKEN),
        devGuildId: z
            .string()
            .min(1)
            .optional()
            .parse(DISCORD_MANAGER_BOT_DEV_GUILD_ID),
        clientId: z.string().min(1).parse(DISCORD_MANAGER_BOT_CLIENT_ID),
        channelSwitcher: {
            generatorPrefix: "➕ ",
            lobbyPrefix: "",
            logsChannelId: z
                .string()
                .min(1)
                .parse(DISCORD_CHANNEL_SWITCHER_VOICE_LOGS_CHANNEL_ID),
            generatorCategoryId: z
                .string()
                .min(1)
                .parse(DISCORD_CHANNEL_SWITCHER_GENERATOR_CATEGORY_ID),
            lobbysCategoryId: z
                .string()
                .min(1)
                .parse(DISCORD_CHANNEL_SWITCHER_LOBBYS_CATEGORY_ID),
            regionRolePrefix: "region:",
            languageRolePrefix: "lang:",
            defaultRegion: "us-e",
            defaultLanguage: "en",
        },
    })

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
