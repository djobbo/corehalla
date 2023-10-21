import { downloadImage } from "./downloadImage"
import { existsSync, mkdirSync, rmSync } from "fs"
import { legends } from "bhapi/legends"
import { load } from "cheerio"
import { logInfo } from "logger"
import axios from "axios"

const APP_DIR = "../../app"
const PUBLIC_DIR = `${APP_DIR}/public`
const BASE_URL = "https://www.brawlhalla.com"
const OUT_DIR = `${PUBLIC_DIR}/images/icons/roster`

export const downloadImages = async (type: "legends" | "crossovers") => {
    logInfo(`Downloading ${type} roster images...`)
    const outDir = `${OUT_DIR}/${type}`
    if (existsSync(outDir)) rmSync(outDir, { recursive: true })
    mkdirSync(outDir, { recursive: true })

    const { data: text } = await axios.get(`${BASE_URL}/${type}`)

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
        .filter(({ name, src }) => name && src)

    imgs.forEach((img) => {
        if (!img.src || !img.name) return

        logInfo(`  => ${img.name}`)

        downloadImage(
            img.src,
            `${outDir}/${
                type === "legends"
                    ? legends.find((l) => l.bio_name === img.name)
                          ?.legend_name_key ?? img.name
                    : img.name
            }.png`,
        )
    })

    logInfo(`Downloaded ${type} roster images!\n`)
}

downloadImages("legends")
downloadImages("crossovers")
