import { startCrawler } from "./crawler"
// import { startBot as startDiscordManagerBot } from "./discord-manager-bot"

const __DEV = process.env.NODE_ENV === "development"

const main = async () => {
    // await startDiscordManagerBot()

    const crawler = startCrawler(
        __DEV
            ? {
                  maxRequestsPer15Minutes: 2000,
                  maxPages: 1,
              }
            : {
                  maxRequestsPer15Minutes: 300,
                  maxPages: 200,
              },
    )
    console.log("Crawler started")

    console.log("All services started")

    await Promise.all([crawler]).catch((error) => {
        console.error("Error in main", error)
    })
}

main()
