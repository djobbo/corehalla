#!/usr/bin/env tsx

import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Logger from "effect/Logger"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import { ChildProcessSpawner } from "effect/unstable/process"

import { runChildProcess } from "./run-child-process.mts"
import { syncVendoredRepos } from "./sync-vendored-repos.mts"

const STUDIO_PORT = 54323
const ENV_PATH = ".env"
const ENV_EXAMPLE_PATH = ".env.example"
const MAX_MIGRATE_RETRIES = 10

const SYNC_KEYS = {
  DATABASE_URL: (s: SupabaseStatus) => s.DB_URL,
  VITE_SUPABASE_URL: (s: SupabaseStatus) => s.API_URL,
  VITE_SUPABASE_ANON_KEY: (s: SupabaseStatus) => s.ANON_KEY,
  SUPABASE_URL: (s: SupabaseStatus) => s.API_URL,
  SUPABASE_SERVICE_KEY: (s: SupabaseStatus) => s.SERVICE_ROLE_KEY,
} as const

type SupabaseStatus = {
  readonly DB_URL: string
  readonly API_URL: string
  readonly ANON_KEY: string
  readonly SERVICE_ROLE_KEY: string
}

type EnvRawEntry = { readonly type: "raw"; readonly line: string }
type EnvVarEntry = { type: "var"; key: string; value: string; line: string }
type EnvEntry = EnvRawEntry | EnvVarEntry

class SetupError extends Data.TaggedError("SetupError")<{
  readonly message: string
}> {}

class CommandError extends Data.TaggedError("CommandError")<{
  readonly command: string
  readonly args: ReadonlyArray<string>
  readonly cause: unknown
}> {}

const formatLogMessage = (message: unknown): string => {
  const parts = Array.isArray(message) ? message : [message]
  return parts.map((part) => (typeof part === "string" ? part : String(part))).join(" ")
}

const setupLineFormatter = Logger.make((options) => `[setup] ${formatLogMessage(options.message)}`)

const setupLogger = Logger.withLeveledConsole(setupLineFormatter)

const parseEnvFile = (content: string): Array<EnvEntry> => {
  const entries: Array<EnvEntry> = []
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      entries.push({ type: "raw", line })
      continue
    }
    const eq = trimmed.indexOf("=")
    if (eq === -1) {
      entries.push({ type: "raw", line })
      continue
    }
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    entries.push({ type: "var", key, value, line })
  }
  return entries
}

const serializeEnvFile = (entries: ReadonlyArray<EnvEntry>) =>
  entries.map((e) => (e.type === "raw" ? e.line : `${e.key}=${e.value}`)).join("\n")

const mergeEnvFile = (existingContent: string, updates: Record<string, string | undefined>) => {
  const entries = parseEnvFile(existingContent)
  const byKey = new Map<string, EnvVarEntry>()
  for (const e of entries) {
    if (e.type === "var") byKey.set(e.key, e)
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") continue
    const prev = byKey.get(key)
    if (prev) {
      prev.value = value
    } else {
      const entry: EnvVarEntry = { type: "var", key, value, line: `${key}=${value}` }
      entries.push(entry)
      byKey.set(key, entry)
    }
  }
  return serializeEnvFile(entries)
}

const runCommand = Effect.fn("runCommand")(function* (command: string, args: ReadonlyArray<string>) {
  const { stdout, stderr, exitCode } = yield* runChildProcess({ command, args }).pipe(
    Effect.mapError(
      (cause) =>
        new CommandError({
          command,
          args,
          cause,
        }),
    ),
  )

  if (exitCode !== ChildProcessSpawner.ExitCode(0)) {
    return yield* Effect.fail(
      new CommandError({
        command,
        args,
        cause: { exitCode, stdout, stderr },
      }),
    )
  }

  return stdout.trim()
})

const dotenvCommand = (args: ReadonlyArray<string>) => runCommand("dotenv", ["-e", ENV_PATH, "--", ...args])

const ensureEnvFile = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem
  if (yield* fs.exists(ENV_PATH)) return
  if (yield* fs.exists(ENV_EXAMPLE_PATH)) {
    yield* fs.copyFile(ENV_EXAMPLE_PATH, ENV_PATH)
    yield* Effect.logInfo(`Created ${ENV_PATH} from ${ENV_EXAMPLE_PATH}`)
    return
  }
  yield* Effect.logError(`Missing ${ENV_PATH} and ${ENV_EXAMPLE_PATH}`)
  return yield* Effect.fail(new SetupError({ message: `Missing ${ENV_PATH} and ${ENV_EXAMPLE_PATH}` }))
})

const syncEnvFromSupabaseStatus = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem
  const raw = yield* dotenvCommand(["pnpm", "exec", "supabase", "status", "-o", "json"])
  const status = yield* Effect.try({
    try: () => JSON.parse(raw) as SupabaseStatus,
    catch: (cause) => new SetupError({ message: `Failed to parse supabase status JSON: ${String(cause)}` }),
  })
  const updates: Record<string, string | undefined> = {}
  for (const [key, getter] of Object.entries(SYNC_KEYS)) {
    updates[key] = getter(status)
  }
  const existing = yield* fs.readFileString(ENV_PATH)
  const merged = mergeEnvFile(existing, updates)
  yield* fs.writeFileString(ENV_PATH, merged.endsWith("\n") ? merged : `${merged}\n`)
  yield* Effect.logInfo("✔️ Synced Supabase keys into .env")
})

const migrateDatabase = Effect.fnUntraced(function* () {
  const attemptRef = yield* Ref.make(0)
  yield* Effect.gen(function* () {
    const attempt = yield* Ref.getAndUpdate(attemptRef, (n) => n + 1)
    if (attempt > 1) {
      yield* Effect.logWarning(`Waiting for database... (retry ${attempt - 1}/${MAX_MIGRATE_RETRIES})`)
    }
    yield* runCommand("pnpm", ["db:migrate"])
  }).pipe(
    Effect.retry({
      times: MAX_MIGRATE_RETRIES - 1,
      schedule: Schedule.spaced("5 seconds"),
    }),
    Effect.catchTag("CommandError", () =>
      Effect.gen(function* () {
        yield* Effect.logError("Max retries exceeded — database migrations failed")
        return yield* Effect.fail(
          new SetupError({ message: "Max retries exceeded — database migrations failed" }),
        )
      }),
    ),
  )
})

const readPackageVersion = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem
  const content = yield* fs.readFileString("./package.json")
  return yield* Effect.try({
    try: () => (JSON.parse(content) as { version: string }).version,
    catch: (cause) => new SetupError({ message: `Failed to read package.json: ${String(cause)}` }),
  })
})

const program = Effect.gen(function* () {
  const version = yield* readPackageVersion()
  yield* Effect.logInfo(`Corehalla ${version}`)

  yield* ensureEnvFile()

  yield* Effect.logInfo("Starting Supabase (Docker)")
  yield* dotenvCommand(["pnpm", "exec", "supabase", "start"]).pipe(
    Effect.catchTag("CommandError", () =>
      Effect.gen(function* () {
        yield* Effect.logError("Failed to start Supabase. Is Docker running?")
        return yield* Effect.fail(new SetupError({ message: "Failed to start Supabase" }))
      }),
    ),
  )
  yield* Effect.logInfo("✔️ Supabase is running")
  yield* Effect.log()

  yield* syncEnvFromSupabaseStatus()
  yield* Effect.log()

  yield* Effect.logInfo("Installing dependencies")
  yield* runCommand("pnpm", ["install"]).pipe(
    Effect.catchTag("CommandError", () =>
      Effect.gen(function* () {
        yield* Effect.logError("Failed to install dependencies")
        return yield* Effect.fail(new SetupError({ message: "Failed to install dependencies" }))
      }),
    ),
  )
  yield* Effect.logInfo("✔️ Installed dependencies")
  yield* Effect.log()

  yield* Effect.logInfo("Syncing vendored repositories")
  yield* syncVendoredRepos({}).pipe(
    Effect.catchTag("VendoredReposError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError(`Failed to sync vendored repositories: ${error.message}`)
        return yield* Effect.fail(new SetupError({ message: "Failed to sync vendored repositories" }))
      }),
    ),
  )
  yield* Effect.log()

  yield* Effect.logInfo("Applying database migrations...")
  yield* migrateDatabase()
  yield* Effect.logInfo("✔️ Migrated database")
  yield* Effect.logInfo("✔️ Dev environment ready")
  yield* Effect.logInfo(`Supabase Studio: http://127.0.0.1:${STUDIO_PORT}`)
  yield* Effect.logInfo(`Web app: http://localhost:3000 (run pnpm dev)`)
})

NodeRuntime.runMain(
  program.pipe(Effect.provide(Logger.layer([setupLogger])), Effect.provide(NodeServices.layer)),
)
