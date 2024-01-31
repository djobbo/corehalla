import { Routes } from "discord-api-types/v9"
import { discordApi } from "./client"
import type { APIConnection } from "discord-api-types/v9"

export const getUserConnections = async (
    discordToken: string,
): Promise<APIConnection[] | null> => {
    try {
        const connections = await discordApi.get<APIConnection[]>(
            discordToken,
            Routes.userConnections(),
        )

        return connections
    } catch (e) {
        return null
    }
}
