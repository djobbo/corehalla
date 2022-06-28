import { Routes } from "discord-api-types/v9"
import { discordApi } from "./client"
import type { APIUser } from "discord-api-types/v9"

export const getDiscordProfile = async (
    discordToken: string,
): Promise<Pick<APIUser, "username" | "avatar"> | null> => {
    try {
        const res = await discordApi.get<APIUser>(discordToken, Routes.user())

        if (res.status !== 200) throw new Error(res.statusText)

        const user = res.data

        return {
            username: user.username,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`,
        }
    } catch (e) {
        return null
    }
}
