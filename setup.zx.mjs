#!/usr/bin/env zx

import { $, cd, chalk, fs, sleep } from "zx"
import { exit } from "node:process"

const { STUDIO_PORT } = process.env

//eslint-disable-next-line no-console
const log = (msg) => console.log(`${chalk.green("[dev-env]")} ${msg}`)

//eslint-disable-next-line no-console
const newLine = () => console.log()

const { version } = await fs.readJson("./package.json")
log(`Corehalla Version: ${version}`)

log("Starting dev environment...")

log(chalk.bold("Installing dependencies"))
try {
    await $`pnpm ci`
} catch {
    log(chalk.red(`Failed to install dependencies`))
    exit(1)
}
log("✔️ Installed dependencies")
newLine()

log(chalk.italic("Waiting for database to start..."))
try {
    const MAX_RETRIES = 10
    cd("packages/db")
    let retriesLeft = MAX_RETRIES
    let dbReady = false

    while (retriesLeft > 0 && !dbReady) {
        try {
            await $`pnpm db:migrate up`
            dbReady = true
        } catch {
            log(
                `Waiting for database to start... (retry ${
                    MAX_RETRIES - retriesLeft + 1
                }/${MAX_RETRIES})`,
            )
            retriesLeft--
            await sleep(5000)
        }
    }

    if (!dbReady) {
        throw new Error("Max retries exceeded, database not ready.")
    }
} catch (e) {
    log(chalk.red("Failed to start dev environment"))
    exit(1)
}

log("✔️ Migrated database")
log("✔️ Dev environment ready")
log(
    `Supabase Studio is running at: ${chalk.blue(
        `http://localhost:${STUDIO_PORT}`,
    )}`,
)
