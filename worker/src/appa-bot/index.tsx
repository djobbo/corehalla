import { Embed, createClient, createSlashCommand } from "reaccord"
import { GatewayIntentBits } from "discord.js"
import { logInfo } from "logger"

const {
    DISCORD_MANAGER_BOT_TOKEN = "",
    DISCORD_MANAGER_BOT_DEV_GUILD_ID,
    DISCORD_MANAGER_BOT_CLIENT_ID,
    DISCORD_MANAGER_BOT_WELCOME_ROLES,
} = process.env

export const startBot = async () => {
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

    client.listenTo("guildMemberAdd", async (member) => {
        member.guild.systemChannel?.send({
            content: `👀 Welcome **${member}** to Corehalla!`,
        })

        if (DISCORD_MANAGER_BOT_WELCOME_ROLES) {
            try {
                await member.roles.add(
                    DISCORD_MANAGER_BOT_WELCOME_ROLES?.split(","),
                )
            } catch {
                throw new Error(
                    `Failed to add roles to ${member.user.tag} (${member.id})`,
                )
            }
        }
    })

    client.listenTo("guildMemberRemove", async (member) => {
        member.guild.systemChannel?.send({
            content: `👋 Goodbye ${member}!`,
        })
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
