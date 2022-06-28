import { Routes } from "discord-api-types/v9"
import { discordApi } from "./client"
import type { APIConnection } from "discord-api-types/v9"

export const getUserConnections = async (
    discordToken: string,
): Promise<APIConnection[] | null> => {
    try {
        const res = await discordApi.get<APIConnection[]>(
            discordToken,
            Routes.userConnections(),
        )

        if (res.status !== 200) throw new Error(res.statusText)

        return res.data
    } catch (e) {
        return null
    }
}
