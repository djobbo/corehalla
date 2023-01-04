import {
    cloneGeneratorChannel,
    deleteChannelIfEmpty,
    isLobbyChannel,
    logUserJoinedVoiceChannel,
} from "./channels"
import {
    getRoomNumber,
    isValidBrawlhallaRoomNumber,
    saveRoomNumber,
} from "./roomNumbers"
import type { BotOptions } from ".."
import type { Client } from "reaccord"

export const startChannelSwitcher = async (
    client: Client,
    options: BotOptions,
) => {
    client.listenTo("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channel?.id === newState.channel?.id) return

        await deleteChannelIfEmpty(oldState, client, options)
        await logUserJoinedVoiceChannel(newState, client, options)
        await cloneGeneratorChannel(newState, client, options).then(
            async (channel) => {
                if (!channel) return
                newState.member?.voice.setChannel(channel)
            },
        )
    })

    client.listenTo("messageCreate", (message) => {
        if (message.author.bot) return

        const channel = message.channel

        if (channel.isDMBased() || !channel.isVoiceBased()) return

        if (!isLobbyChannel(channel, options)) return

        if (isValidBrawlhallaRoomNumber(message.content)) {
            saveRoomNumber(channel, message.content)
            message.channel.send(
                `Le numéro de la room est maintenant: \`${message.content}\`.`,
            )
            return
        } else if (message.content === "room") {
            const roomNumber = getRoomNumber(channel)
            if (roomNumber) {
                message.channel.send(
                    `Le numéro de la room est \`${roomNumber}\`.`,
                )
            } else {
                message.channel.send(
                    `Le numéro de la room n'est pas encore défini.`,
                )
            }
            return
        }
    })
}
