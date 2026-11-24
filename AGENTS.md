# Agent guidelines

## Library source of truth: installed packages

The installed packages under `node_modules` are the **source of truth** for library APIs, docs and best practices — pinned to the versions in `pnpm-lock.yaml`. Read them before relying on training data or web search. Packages resolve from the workspace root **and** from the consuming package (`apps/<app>/node_modules`, `packages/<pkg>/node_modules`).

When using a library:

1. Read the docs shipped with the package — at its root **and** in the relevant subpackage — in this order: `AGENTS.md`, `LLMS.md`, `ai-docs/`, `README.md`.
2. Read the package source for the APIs you will call. Do not invent APIs or copy outdated patterns.
3. If the package ships no docs, read its type declarations.

Libraries that matter here: `effect` and `@effect/*` (including `@effect/vitest`, `@effect/platform-node`), `foldkit`, `alchemy` and `@alchemy.run/*`, `vite-plus`, `@tanstack/react-router` / `@tanstack/react-start`, `drizzle-orm`, `shadcn`.

## TypeScript and Effect

All JS code should be TypeScript. Use Effect as much as possible.

- Prefer Effect native modules instead of Node (e.g. `FileSystem` / `Path`, not `node:fs`).
- Use Schema bidirectional validation instead of `JSON.parse` / `JSON.stringify`.
- Prefer `Effect.gen` / `Effect.fn` over vanilla functions.
- Prefer Context layers for well-defined modules, for better testability and implementation swappability.
- Use `@effect/vitest` for tests.

Follow Effect best practices from the installed `effect` / `@effect/*` packages (`AGENTS.md`, `ai-docs/`).

## Comments

Do not write superfluous comments. If the code is self-readable, leave it uncommented. Add a comment only when it explains something the code cannot (a non-obvious constraint, invariant, or why), and keep that comment concise.

## API changes

This project is pre-release (no external consumers). **Delete** obsolete APIs and update call sites/tests in the same change. Do **not** leave `@deprecated` wrappers, aliases, or compatibility shims.

## Toolchain: `vp`

Use **`vp`** as the primary package manager and toolchain. It is pnpm under the hood. Do not use `pnpm`, `npm`, or `yarn` unless `vp` cannot do the job.

| Command                                   | Purpose                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `vp i`                                    | Install dependencies                                                                       |
| `effect-tsgo vp check`                    | Format, lint and type-check the workspace with [tsrs](https://github.com/oxc-project/tsrs) |
| `effect-tsgo vp check --fix`              | Same, applying auto-fixes                                                                  |
| `effect-tsgo vp lint`                     | Lint only, with the Effect rules                                                           |
| `vp test`                                 | Run tests (Vitest)                                                                         |
| `effect-tsgo vp check --no-fmt --no-lint` | Type-check only (`ts:check`)                                                               |

`vp check` is the single static gate: it type-checks every package with tsrs and
runs the [@effect/tsgo](https://github.com/Effect-TS/tsgo) `strict` preset, where
every recommended Effect diagnostic is an error. Run it through `effect-tsgo
vp` so Oxlint loads the Effect-patched binding; plain `vp check` has no Effect
rules. An experimental Effect module used on purpose (`effect/ai`,
`effect/cli`, `effect/workflow`) is allowed per package through
`allowedExperimentalApis` in that package's `tsconfig.json` — never by
downgrading the diagnostic globally.

After code changes, run `effect-tsgo vp check --fix`, `vp run -r ts:check`, and `vp test` in the affected package (or from the workspace root). Use `vp run <script>` only for `package.json` scripts / Vite+ tasks that are not built-in commands.
