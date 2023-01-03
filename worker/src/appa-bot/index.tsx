import { ActivityType, GatewayIntentBits } from "discord.js"
import { Embed, createClient, createSlashCommand } from "reaccord"
import { logInfo } from "logger"

const {
    DISCORD_MANAGER_BOT_ENABLED = "false",
    DISCORD_MANAGER_BOT_TOKEN = "",
    DISCORD_MANAGER_BOT_DEV_GUILD_ID,
    DISCORD_MANAGER_BOT_CLIENT_ID,
} = process.env

const ENABLED = DISCORD_MANAGER_BOT_ENABLED === "true"

export const startBot = async () => {
    if (!ENABLED) {
        logInfo("🤖 Bot disabled")
        return
    }

    const client = createClient({
        token: DISCORD_MANAGER_BOT_TOKEN,
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ],
        devGuildId: DISCORD_MANAGER_BOT_DEV_GUILD_ID,
        clientId: DISCORD_MANAGER_BOT_CLIENT_ID,
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
