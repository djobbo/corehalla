import { config as loadEnv } from "dotenv"
import { logInfo } from "@crh/logger"
import { startBot as startDiscordManagerBot } from "./appa-bot"
import { z } from "zod"

loadEnv()

/**
 * This process hosts the Discord bot only.
 *
 * It used to run the leaderboard crawler as well. That crawled a single
 * hard-coded ladder (`1v1` / `all`) from an in-process loop, and its resume
 * branch returned out of the run loop when a progress row existed — so it
 * terminated itself on the second start and otherwise re-crawled the same first
 * pages forever.
 *
 * Crawling now lives in `@crh/api` as an Effect service, driven by a Cloudflare
 * cron producing onto a queue. Two crawlers must never run at once: they share
 * one Brawlhalla API key, so leaving this one in place would halve the budget
 * available to the new one.
 */

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

    logInfo("All services started")
}

main()
