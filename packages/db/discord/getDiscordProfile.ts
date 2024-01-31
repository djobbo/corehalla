import { Routes } from "discord-api-types/v9"
import { discordApi } from "./client"
import type { APIUser } from "discord-api-types/v9"

export const getDiscordProfile = async (
    discordToken: string,
): Promise<Pick<APIUser, "username" | "avatar"> | null> => {
    try {
        const user = await discordApi.get<APIUser>(discordToken, Routes.user())

        return {
            username: user.username,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
        }
    } catch (e) {
        return null
    }
}
