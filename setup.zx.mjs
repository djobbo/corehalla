#!/usr/bin/env zx

import { $, chalk, fs } from "zx"
import { exit } from "node:process"
import path from "node:path"

const ROOT = process.cwd()

// oxlint-disable-next-line no-console
const log = (msg) => console.log(`${chalk.green("[dev-env]")} ${msg}`)
// oxlint-disable-next-line no-console
const newLine = () => console.log()

const { version } = await fs.readJson(path.join(ROOT, "package.json"))
log(`Corehalla Version: ${version}`)
newLine()

log("Starting dev environment...")

// --- 1. dependencies --------------------------------------------------------

log(chalk.bold("Installing dependencies"))
try {
    await $`vp install`
} catch {
    log(chalk.red("Failed to install dependencies"))
    exit(1)
}
log("✔️ Installed dependencies")
newLine()

// --- 2. local Supabase stack ------------------------------------------------

// `supabase start` brings up Postgres, PostgREST, Auth and Realtime using the
// CLI's built-in stack (see `supabase/config.toml`) and waits for health.
log(chalk.bold("Starting the local Postgres"))
try {
    await $`vp exec supabase start`
} catch {
    log(
        chalk.red(
            "Failed to start Postgres. Is Docker running? See `supabase/config.toml`.",
        ),
    )
    exit(1)
}
newLine()

// --- 3. local env -----------------------------------------------------------

log(chalk.bold("Writing local environment files"))

const status = await $`vp exec supabase status -o env`.quiet()
const local = Object.fromEntries(
    status.stdout
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.includes("="))
        .map((line) => {
            const [key, ...rest] = line.split("=")
            const value = rest.join("=").trim()
            return [
                key,
                value.startsWith('"') && value.endsWith('"')
                    ? value.slice(1, -1)
                    : value,
            ]
        }),
)

// Supabase is a Postgres host now: the only value the app and the
// worker need is the database URL.
for (const key of ["DB_URL"]) {
    if (!local[key]) {
        log(chalk.red(`Could not read ${key} from \`supabase status\``))
        exit(1)
    }
}

/**
 * Rewrites the listed keys in an env file, keeping every other line (API keys,
 * analytics ids, …) untouched.
 */
const writeEnv = async (file, values) => {
    const target = path.join(ROOT, file)
    const existing = (await fs.pathExists(target))
        ? await fs.readFile(target, "utf8")
        : ""

    const pending = new Map(Object.entries(values))
    const lines = existing.split("\n").map((line) => {
        const match = /^\s*([A-Z0-9_]+)\s*=/.exec(line)
        if (match && pending.has(match[1])) {
            const value = pending.get(match[1])
            pending.delete(match[1])
            return `${match[1]}=${value}`
        }

        return line
    })

    while (lines.length > 0 && lines.at(-1).trim() === "") lines.pop()

    if (pending.size > 0) {
        lines.push("", "# --- local Postgres (pnpm setup:env) ---")
        for (const [key, value] of pending) lines.push(`${key}=${value}`)
    }

    await fs.writeFile(target, lines.join("\n") + "\n")
    log(`  ${chalk.cyan(file)}`)
}

const database = { DATABASE_URL: local.DB_URL }

await writeEnv("packages/db/.env", database)
await writeEnv("web/.env.local", database)
await writeEnv("worker/.env", database)

newLine()

// --- 4. database ------------------------------------------------------------

log(chalk.bold("Applying database migrations"))
try {
    await $`vp run --filter db db:migrate`
} catch {
    log(chalk.red("Failed to migrate the database"))
    exit(1)
}
log("✔️ Migrated database")
newLine()

// --- 5. summary -------------------------------------------------------------

log("✔️ Dev environment ready")
log(`Supabase Studio is running at: ${chalk.blue(local.STUDIO_URL ?? "")}`)
log(`Postgres is running at:        ${chalk.blue(local.DB_URL)}`)
newLine()
log(`Start the apps with: ${chalk.bold("pnpm dev")}`)
