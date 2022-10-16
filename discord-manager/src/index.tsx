import { GatewayIntentBits } from "discord.js"
import { createClient } from "reaccord"

const {
    DISCORD_MANAGER_BOT_TOKEN = "",
    DISCORD_MANAGER_BOT_DEV_GUILD_ID,
    DISCORD_MANAGER_BOT_CLIENT_ID,
} = process.env

const client = createClient({
    token: DISCORD_MANAGER_BOT_TOKEN,
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    devGuildId: DISCORD_MANAGER_BOT_DEV_GUILD_ID,
    clientId: DISCORD_MANAGER_BOT_CLIENT_ID,
})

client.listenTo("guildMemberAdd", (member) => {
    member.guild.systemChannel?.send(`Welcome ${member} to the server!`)
})

client.connect(() =>
    // eslint-disable-next-line no-console
    console.log(`🚀 Client connected as ${client.user?.username}!`),
)
