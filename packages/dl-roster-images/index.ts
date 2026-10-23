import { downloadImage } from "./downloadImage"
import { mkdirSync, rmSync } from "fs"
import { join } from "path"
import { legends } from "bhapi/legends"
import { load } from "cheerio"
import { logInfo } from "logger"
import axios from "axios"

const PUBLIC_DIR = join(__dirname, "../../app/public")
const LEGENDS_URL = "https://www.brawlhalla.com/legends/"
const LEGENDS_DIR = join(PUBLIC_DIR, "images/icons/roster/legends")

export const downloadImages = async () => {
    rmSync(LEGENDS_DIR, { recursive: true, force: true })
    mkdirSync(LEGENDS_DIR, { recursive: true })

    const { data: text } = await axios.get(LEGENDS_URL)
    const $ = load(text)

    const imgs = $(".legend-icon")
        .map((_, el) => {
            const img = $(el).find("img")

            return {
                name: img.attr("alt")?.trim() ?? "",
                src: img.attr("src")?.trim() ?? "",
            }
        })
        .get()
        .filter(({ name, src }) => name && src)

    await Promise.all(
        imgs.map(async (img) => {
            const fileName = legends.find(
                (legend) => legend.bio_name === img.name,
            )?.legend_name_key

            if (!fileName) {
                logInfo(`Skipping unmatched legend: ${img.name}`)
                return
            }

            logInfo(`Downloading: legend => ${img.name}`)
            await downloadImage(img.src, join(LEGENDS_DIR, `${fileName}.png`))
        }),
    )

    logInfo(`Downloaded ${imgs.length} roster legend images`)
}

downloadImages()
