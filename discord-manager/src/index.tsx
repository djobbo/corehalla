import { GatewayIntentBits } from "discord.js"
import { createClient, createSlashCommand } from "reaccord"

const {
    DISCORD_MANAGER_BOT_TOKEN = "",
    DISCORD_MANAGER_BOT_DEV_GUILD_ID,
    DISCORD_MANAGER_BOT_CLIENT_ID,
    DISCORD_MANAGER_BOT_WELCOME_ROLES,
} = process.env

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
        allowedMentions: { users: [] },
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
        allowedMentions: { users: [] },
    })
})

const infoCommand = createSlashCommand("info", "Get info about Corehalla") //
    .exec(async (_, interaction) => {
        await interaction.reply({
            content: "Corehalla",
        })
    })

client //
    .registerCommand(infoCommand)
    .connect(() =>
        // eslint-disable-next-line no-console
        console.log(`🚀 Client connected as ${client.user?.username}!`),
    )
