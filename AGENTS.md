# Agent guidelines

## Library source of truth: `.repos`

If `.repos/` exists, treat clones there as the **source of truth** for commonly used libraries in this repo (APIs, docs, best practices, and implementation details). Prefer them over training data and web search.

When using a library:

1. Look for `LLMS.md` or `AGENTS.md` in the clone — at the repo root **and** in relevant subpackages (e.g. `.repos/<library>/packages/<pkg>/`) — and read those first.
2. Read the library’s source for the APIs you will call. Do not invent APIs or copy outdated patterns.
3. If `.repos/` is missing or does not contain the library, fall back to the installed package under `node_modules` (workspace root or the consuming package). Read shipped `LLMS.md` / `AGENTS.md` and source there. This is especially important for **effect** and **alchemy**.

`.repos/` is gitignored and may be missing.

Typical clones: `effect`, `vite-plus`, `alchemy`, `anti-slop`, `tanstack-router` (for both tanstack router and tanstack start), `drizzle-orm`, `shadcn-ui`.

## TypeScript and Effect

All JS code should be TypeScript. Use Effect as much as possible.

- Prefer Effect native modules instead of Node (e.g. `FileSystem` / `Path`, not `node:fs`).
- Use Schema bidirectional validation instead of `JSON.parse` / `JSON.stringify`.
- Prefer `Effect.gen` / `Effect.fn` over vanilla functions.
- Prefer Context layers for well-defined modules, for better testability and implementation swappability.
- Use `@effect/vitest` for tests.

Follow Effect best practices from `.repos/effect` (`LLMS.md` / `AGENTS.md`) or the installed `effect` / `@effect/*` packages.

## Comments

Do not write superfluous comments. If the code is self-readable, leave it uncommented. Add a comment only when it explains something the code cannot (a non-obvious constraint, invariant, or why), and keep that comment concise.

## API changes

This project is pre-release (no external consumers). **Delete** obsolete APIs and update call sites/tests in the same change. Do **not** leave `@deprecated` wrappers, aliases, or compatibility shims.

## Toolchain: `vp`

Use **`vp`** as the primary package manager and toolchain. It is pnpm under the hood. Do not use `pnpm`, `npm`, or `yarn` unless `vp` cannot do the job.

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `vp i`           | Install dependencies                      |
| `vp check`       | Format, type-check (tsgo), and lint (oxc) |
| `vp check --fix` | Same as `vp check`, applying auto-fixes   |
| `vp test`        | Run tests (Vitest)                        |

After code changes, run `vp check --fix` and `vp test` in the affected package (or from the workspace root). Use `vp run <script>` only for `package.json` scripts / Vite+ tasks that are not built-in commands.
