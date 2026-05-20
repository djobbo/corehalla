import { ActivityType, GatewayIntentBits } from "discord.js"
import { logInfo } from "logger"
import { Embed, createClient, createSlashCommand } from "reaccord"

import { startChannelSwitcher } from "./channel-switcher"

export type BotOptions = {
    enabled: boolean
    token: string
    devGuildId?: string
    clientId: string
    channelSwitcher: {
        generatorPrefix: string
        lobbyPrefix: string
        logsChannelId: string
        regionRolePrefix: string
        languageRolePrefix: string
        defaultRegion: string
        defaultLanguage: string
        generatorCategoryId: string
        lobbysCategoryId: string
    }
}

export const startBot = async (options: BotOptions) => {
    const { enabled, token, devGuildId, clientId } = options

    if (!enabled) {
        logInfo("🤖 Bot disabled")
        return
    }

    const client = createClient({
        token,
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessageReactions,
        ],
        devGuildId,
        clientId,
    })

    client.on("ready", () => {
        client.user?.setPresence({
            activities: [
                {
                    name: "over Valhalla",
                    type: ActivityType.Watching,
                    url: "https://corehalla.com",
                },
            ],
        })
        logInfo("🤖 Bot ready")
    })

    await startChannelSwitcher(client, options)

    const infoCommand = createSlashCommand("info", "Get info about Corehalla") //
        .render(
            () => {
                return (
                    <Embed color="Blurple">
                        <Embed.Title>Corehalla</Embed.Title>
                    </Embed>
                )
            },
            { unmountAfter: 0 },
        )

    await client //
        .registerCommand(infoCommand)
        .connect(() =>
            logInfo(`🚀 Client connected as ${client.user?.username}!`),
        )
        .catch((error) => {
            logInfo(`❌ Client failed to connect: ${error}`)
        })
}
