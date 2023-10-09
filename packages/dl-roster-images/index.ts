import { downloadImage } from "./downloadImage"
import { existsSync, mkdirSync, rmdirSync } from "fs"
import { legends } from "bhapi/legends"
import { load } from "cheerio"
import { logInfo } from "logger"
import axios from "axios"

const APP_DIR = "../../app"
const PUBLIC_DIR = `${APP_DIR}/public`
const LEGENDS_URL = "https://www.brawlhalla.com/legends/"
const OUT_DIR = `${PUBLIC_DIR}/images/icons/roster`

export const downloadImages = async () => {
    if (existsSync(OUT_DIR)) rmdirSync(OUT_DIR, { recursive: true })
    mkdirSync(OUT_DIR)
    mkdirSync(`${OUT_DIR}/legends`)
    mkdirSync(`${OUT_DIR}/crossovers`)

    const { data: text } = await axios.get(LEGENDS_URL)

    const $ = load(text)

    const imgs = $(".legend-icon")
        .map((_, el) => {
            const img = $(el).find("img")

            return {
                name: img?.attr("alt") ?? "",
                src: img?.attr("src") ?? "",
            }
        })
        .get()
        .filter(({ name, src }) => (console.log({ name, src }), name && src))

    imgs.forEach((img, i) => {
        if (!img.src || !img.name) return

        // TODO: readd crossovers
        const isLegend = true
        const prefix = isLegend ? "legend" : "crossover"

        logInfo(`Downloading: ${prefix} => ${img.name}`)

        downloadImage(
            img.src,
            `${OUT_DIR}/${prefix}s/${
                isLegend
                    ? legends.find((l) => l.bio_name === img.name)
                          ?.legend_name_key ?? img.name
                    : img.name
            }.png`,
        )
    })

    logInfo("Downloaded roster images!")
}

downloadImages()
