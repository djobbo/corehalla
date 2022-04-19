import axios from "axios"

const DISCORD_API_URL = "https://discord.com/api"

export const discordApi = {
    get: <T>(discordToken: string, url: `/${string}`) =>
        axios.get<T>(`${DISCORD_API_URL}${url}`, {
            headers: {
                Authorization: `Bearer ${discordToken}`,
            },
        }),
}
