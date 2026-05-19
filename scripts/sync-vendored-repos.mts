import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { ChildProcessSpawner } from "effect/unstable/process"

import { runChildProcess } from "./run-child-process.mts"

const REPOS_ROOT = ".repos"

type VendoredRepo = {
  readonly name: string
  readonly url: string
  readonly branch: string
}

/** Upstream repos cloned shallowly under `.repos/` for local reference (not committed). */
const VENDORED_REPOS: ReadonlyArray<VendoredRepo> = [
  {
    name: "effect",
    url: "https://github.com/Effect-TS/effect-smol.git",
    branch: "main",
  },
  {
    name: "tanstack-router",
    url: "https://github.com/TanStack/router.git",
    branch: "main",
  },
  {
    name: "tanstack-query",
    url: "https://github.com/TanStack/query.git",
    branch: "main",
  },
  {
    name: "supabase",
    url: "https://github.com/supabase/supabase.git",
    branch: "master",
  },
  {
    name: "base-ui",
    url: "https://github.com/mui/base-ui.git",
    branch: "master",
  },
]

export class VendoredReposError extends Data.TaggedError("VendoredReposError")<{
  readonly message: string
  readonly repo?: string
  readonly cause?: unknown
}> {}

const repoPath = (name: string) => `${REPOS_ROOT}/${name}`

const runGit = Effect.fn("runGit")(function* (args: ReadonlyArray<string>) {
  const fullCommand = `git ${args.join(" ")}`
  const { stdout, stderr, exitCode } = yield* runChildProcess({ command: "git", args }).pipe(
    Effect.mapError(
      (cause) =>
        new VendoredReposError({
          message: `git ${args.join(" ")} failed`,
          cause,
        }),
    ),
  )

  if (exitCode !== ChildProcessSpawner.ExitCode(0)) {
    return yield* Effect.fail(
      new VendoredReposError({
        message: `${fullCommand} exited with code ${exitCode}`,
        cause: { exitCode, stdout, stderr },
      }),
    )
  }
})

const cloneRepo = (repo: VendoredRepo) =>
  runGit([
    "clone",
    "--depth",
    "1",
    "--branch",
    repo.branch,
    "--single-branch",
    repo.url,
    repoPath(repo.name),
  ])

const pullRepo = (repo: VendoredRepo) =>
  Effect.gen(function* () {
    const path = repoPath(repo.name)
    yield* runGit(["-C", path, "fetch", "--depth", "1", "origin", repo.branch])
    yield* runGit(["-C", path, "reset", "--hard", `origin/${repo.branch}`])
  })

const syncOneRepo = Effect.fn("syncOneRepo")(function* (repo: VendoredRepo, force: boolean) {
  const fs = yield* FileSystem.FileSystem
  const path = repoPath(repo.name)
  const exists = yield* fs.exists(path)

  if (force && exists) {
    yield* fs.remove(path, { recursive: true })
    yield* Effect.logInfo(`Removed ${path}`)
  }

  const present = yield* fs.exists(path)
  if (!present || force) {
    yield* Effect.logInfo(`Cloning ${repo.url} → ${path} (${repo.branch}, depth 1)`)
    yield* cloneRepo(repo)
    yield* Effect.logInfo(`✔️ ${path}`)
    return
  }

  const isGit = yield* fs.exists(`${path}/.git`)
  if (!isGit) {
    return yield* Effect.fail(
      new VendoredReposError({
        message: `${path} exists but is not a git repository; re-run with force: true`,
        repo: repo.name,
      }),
    )
  }

  yield* Effect.logInfo(`Updating ${path} (${repo.branch})`)
  yield* pullRepo(repo)
  yield* Effect.logInfo(`✔️ ${path}`)
})

export type SyncVendoredReposOptions = {
  /** Remove existing clones and re-download shallow copies. */
  readonly force?: boolean
}

export const syncVendoredRepos = Effect.fn("syncVendoredRepos")(function* (
  options: SyncVendoredReposOptions = {},
) {
  const force = options.force ?? false
  const fs = yield* FileSystem.FileSystem

  if (!(yield* fs.exists(REPOS_ROOT))) {
    yield* fs.makeDirectory(REPOS_ROOT, { recursive: true })
  }

  for (const repo of VENDORED_REPOS) {
    yield* syncOneRepo(repo, force).pipe(
      Effect.mapError((cause) =>
        cause instanceof VendoredReposError
          ? cause
          : new VendoredReposError({
              message: `Failed to sync ${repo.name}`,
              repo: repo.name,
              cause,
            }),
      ),
    )
  }
})
