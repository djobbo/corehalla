import { React } from 'fancy-discord.js/lib/Embeds'
import { config } from 'dotenv'
import { Client } from 'fancy-discord.js'
import { Callback, CommandCallbackRequest } from 'fancy-discord.js/lib/types'
import { fetchPlayerFormat } from '@corehalla/core'
import { RankEmbed } from './RankEmbed'
import { createEmbed } from 'fancy-discord.js/lib/Embeds'
config()

const { DISCORD_TOKEN, BRAWLHALLA_API_KEY } = process.env
const COMMAND_PREFIX = 'c!'

const client = new Client({ commandPrefix: COMMAND_PREFIX })

const checkServer: Callback<CommandCallbackRequest> = ({ message: { author, channel } }, next) => {
    channel.send(`Hi ${author.username}!`)
    next?.()
}

client.cmd('rankId [id]', checkServer, async ({ query: { id }, message: { channel } }) => {
    if (!BRAWLHALLA_API_KEY) return
    if (!id) return

    console.log(`Fetching stats for id:${id}`)

    const stats = await fetchPlayerFormat(BRAWLHALLA_API_KEY, id)
    if (!stats) return

    console.log(`Successfully fetched stats for id:${id}`)

    const embed = createEmbed(<RankEmbed playerStats={stats} type="ranked" iconUrl={client.user?.avatarURL()} />)
    const message = await channel.send(embed)

    //FIXME: await promise type
    client.addReactions(message, ['📈', '🥇'])

    client.onReactionAdd([message.id], ['📈', '🥇'], async ({ reaction, user }) => {
        await reaction.users.remove(user.id)
        switch (reaction.emoji.name) {
            case '📈':
                await message.edit(
                    createEmbed(<RankEmbed playerStats={stats} type="stats" iconUrl={client.user?.avatarURL()} />),
                )
                return
            case '🥇':
                await message.edit(
                    createEmbed(<RankEmbed playerStats={stats} type="ranked" iconUrl={client.user?.avatarURL()} />),
                )
                return
            default:
                return
        }
    })
})

client.on('ready', () => console.log(`🤖 Connected as ${client.user?.tag}`))

client.login(DISCORD_TOKEN)
