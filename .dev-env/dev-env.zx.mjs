#!/usr/bin/env zx

import { $, cd, chalk, fs, sleep } from "zx"
import { join } from "node:path"
import { config as loadEnv } from "dotenv"


const DEV_ENV_PATH = __dirname

const envPath = join(DEV_ENV_PATH, ".env")

loadEnv({ path: envPath })

const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_LOCAL_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
    SITE_URL,
    PUBLIC_REST_URL,
    STUDIO_PORT,
} = process.env

process.env.DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_LOCAL_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`

const [, , , command, ...args] = process.argv

if (!args.includes('--verbose')) {
    $.verbose = false
}

const composeFilePath = `${DEV_ENV_PATH}/docker-compose.dev.yml`

//eslint-disable-next-line no-console
const log = (msg) => console.log(`${chalk.green("[dev-env]")} ${msg}`)

const showVersion = async () => {
    const { version } = await fs.readJson("./package.json")
    log(`Version: ${version}`)
}

const build = async () => {
    log(chalk.bold("Docker images"))
    try {
        await $`sudo docker compose -f ${composeFilePath} build --no-cache`
        log("✔️ Built docker images")
    } catch (e) {
        log("Build failed")
    }
}

const start = async () => {
    log("Starting...")
    try {
        log(chalk.bold("Dependencies"))
        await $`pnpm install`
        log("✔️ Installed dependencies")

        log(chalk.bold("Containers"))
        await $`sudo docker compose -f ${composeFilePath} up -d`
        log("✔️ Started containers")

        log(chalk.italic("Waiting for database to start..."))
        cd("packages/db")
        let retriesLeft = 10
        let dbReady = false

        while (retriesLeft > 0 && !dbReady) {
            try {
                await $`pnpm db:migrate up`
                log("✔️ Migrated database")
                dbReady = true
            } catch {
                log(
                    `Waiting for database to start... (retry ${
                        retries + 1
                    }/${MAX_RETRIES})`,
                )
                retries--
                await sleep(5000)
            }
        }

        if (!dbReady) {
            throw new Error("Max retries exceeded, database not ready.")
        }

        log("✔️ Dev environment ready")
        log(`App is running at: ${chalk.blue(SITE_URL)}`)
        log(`Public API is running at: ${chalk.blue(PUBLIC_REST_URL)}`)
        log(
            `Studio is running at: ${chalk.blue(
                `http://localhost:${STUDIO_PORT}`,
            )}`,
        )
    } catch (e) {
        log(chalk.red("Failed to start dev environment"))
        await $`sudo docker compose -f ${composeFilePath} down`
    }
}

const stop = async () => {
    log("Stopping...")
    try {
        await $`sudo docker compose -f ${composeFilePath} stop`
        log("✔️ Dev environment stopped")
    } catch (e) {
        log("Failed to stop dev environment")
    }
}

const showLogs = async (follow) => {
    $.verbose = true
    log("Showing logs...")
    try {
        if (follow) {
            await $`sudo docker logs corehalla-app -f --tail 200`
            return
        }
        await $`sudo docker logs corehalla-app`
    } catch (e) {
        log("Failed to get logs")
    }
}

const exec = async (cmd) => {
    log(`Running command ${cmd}...`)
    try {
        await $`sudo docker exec -it corehalla-app ${cmd}`
    } catch (e) {
        log("Failed to run command")
    }
}

const runPnpm = async (cmd) => {
    log(`Running pnpm ${cmd}...`)
    try {
        await exec(`pnpm ${cmd}`)
    } catch (e) {
        log("Failed to run command")
    }
}

const restart = async () => {
    log("Restarting...")
    try {
        await $`sudo docker compose -f ${composeFilePath} restart`
        log("Restarted")
    } catch (e) {
        log("Failed to restart")
    }
}

const remove = async () => {
    await stop()
    log("Removing...")
    try {
        await $`sudo docker compose -f ${composeFilePath} rm -f`
        log("Removed all containers")
    } catch (e) {
        log("Failed to remove containers")
    }
}

const main = async () => {
    switch (command) {
        case "version":
            await showVersion()
            break
        case "build":
            await build()
            break
        case "up":
            await build()
            await start()
            break
        case "start":
            await start()
            break
        case "down":
        case "stop":
            await stop()
            break
        case "logs":
            await showLogs(args[0] === "-f")
            break
        case "pnpm":
            await runPnpm(args.join(" "))
            break
        case "exec":
            await exec(args.join(" "))
            break
        case "restart":
        case "reload":
            await restart()
            break
        case "rm":
            await remove()
            break
        default:
            log("Unknown command")
            break
    }
}

main()
