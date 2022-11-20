import { startApi } from "./api"
import { startCrawler } from "./crawler"
// import { startBot as startDiscordManagerBot } from "./discord-manager-bot"

const __DEV = process.env.NODE_ENV === "development"

const main = async () => {
    // await startDiscordManagerBot()

    // startCrawler(
    //     __DEV
    //         ? {
    //               maxRequestsPer15Minutes: 2000,
    //               maxPages: 1,
    //           }
    //         : {
    //               maxRequestsPer15Minutes: 300,
    //               maxPages: 200,
    //           },
    // )
    // console.log("Crawler started")

    startApi()
    console.log("API started")

    console.log("All services started")

    Promise.all([startCrawler, startApi]).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}

main()

export type { AppRouter as WorkerAPI } from "./api"
