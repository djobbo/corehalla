import { startCrawler } from "./crawler"
// import { startBot as startDiscordManagerBot } from "./discord-manager-bot"

const main = async () => {
    // await startDiscordManagerBot()
    await startCrawler()
}

main()
