const DISCORD_API_URL = "https://discord.com/api"

export const discordApi = {
    get: <T>(discordToken: string, url: `/${string}`) =>
        // TODO: validate response with zod
        fetch(`${DISCORD_API_URL}${url}`, {
            headers: {
                Authorization: `Bearer ${discordToken}`,
            },
        }).then((res) => res.json() as Promise<T>),
}
