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
log(chalk.bold("Starting the local Supabase stack"))
try {
    await $`vp exec supabase start`
} catch {
    log(
        chalk.red(
            "Failed to start Supabase. Is Docker running? See `supabase/config.toml`.",
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

for (const key of ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "DB_URL"]) {
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
        lines.push("", "# --- local Supabase (pnpm setup:env) ---")
        for (const [key, value] of pending) lines.push(`${key}=${value}`)
    }

    await fs.writeFile(target, lines.join("\n") + "\n")
    log(`  ${chalk.cyan(file)}`)
}

const supabaseServer = {
    SUPABASE_URL: local.API_URL,
    SUPABASE_SERVICE_KEY: local.SERVICE_ROLE_KEY,
    DATABASE_URL: local.DB_URL,
}

const supabasePublic = {
    NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.ANON_KEY,
}

// `web` reads the `VITE_` prefix and still accepts the legacy `NEXT_PUBLIC_`
// one; `app` is Next.js and only reads `NEXT_PUBLIC_`.
const supabaseVite = {
    VITE_SUPABASE_URL: local.API_URL,
    VITE_SUPABASE_ANON_KEY: local.ANON_KEY,
}

await writeEnv("packages/db/.env", { DATABASE_URL: local.DB_URL })
await writeEnv("web/.env.local", {
    ...supabaseServer,
    ...supabasePublic,
    ...supabaseVite,
})
await writeEnv("app/.env.local", { ...supabaseServer, ...supabasePublic })
await writeEnv("worker/.env", { ...supabaseServer })

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
log(`Supabase API is running at:    ${chalk.blue(local.API_URL)}`)
newLine()
log(`Start the apps with: ${chalk.bold("pnpm dev")}`)
