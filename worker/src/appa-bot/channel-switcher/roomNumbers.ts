import type { VoiceChannel } from "discord.js"
import { z } from "zod"

const brawlhallaRoomNumbers = new Map<string, string>()

const brawlhallaRoomNumberRegex = /^\d{6}$/
export const isValidBrawlhallaRoomNumber = (content: string) => {
    try {
        z.string().regex(brawlhallaRoomNumberRegex).parse(content)
        return true
    } catch {
        return false
    }
}

export const saveRoomNumber = async (
    channelId: VoiceChannel,
    roomNumber: string,
) => {
    brawlhallaRoomNumbers.set(channelId.id, roomNumber)
}

export const getRoomNumber = (channelId: VoiceChannel) => {
    return brawlhallaRoomNumbers.get(channelId.id)
}

export const deleteRoomNumber = (channelId: VoiceChannel) => {
    brawlhallaRoomNumbers.delete(channelId.id)
}
