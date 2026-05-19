# Agent guidance

## Vendored upstream (`.repos`)

Trees under `.repos/` are **local shallow clones** of upstream repositories (gitignored, not committed). They are the **source of truth** on disk for how we implement, debug, and document behavior of the matching installed dependencies.

When working on code that uses these libraries:

1. **Read and cite** the vendored tree first — package source, tests, examples, migration notes, and bundled docs inside `.repos` — instead of guessing from npm types alone, third-party summaries, or stale web pages.
2. **Follow patterns** shown in upstream examples and tests in the vendored tree unless this project documents an intentional deviation.
3. **Refresh** vendored copies with `syncVendoredRepos` from [scripts/sync-vendored-repos.mts](scripts/sync-vendored-repos.mts) when you need newer upstream behavior (`pnpm setup` runs it automatically; use `{ force: true }` for a clean re-clone). See [.plans/vendored-repos.md](.plans/vendored-repos.md).

| Prefix                   | Upstream                                                                     | Use for npm packages                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `.repos/effect`          | [Effect-TS/effect-smol](https://github.com/Effect-TS/effect-smol) (`main`)   | `effect` and related Effect v4 packages from that monorepo                                        |
| `.repos/tanstack-router` | [TanStack/router](https://github.com/TanStack/router) (`main`)               | `@tanstack/react-router`, `@tanstack/react-start`, and their workspace siblings in that monorepo  |
| `.repos/tanstack-query`  | [TanStack/query](https://github.com/TanStack/query) (`main`)                 | `@tanstack/react-query`, `@tanstack/query-core`, and their workspace siblings in that monorepo    |
| `.repos/supabase`        | [supabase/supabase](https://github.com/supabase/supabase) (`main`)           | `@supabase/supabase-js`, platform docs, and JS client packages under `packages/` in that monorepo |
| `.repos/base-ui`         | [mui/base-ui](https://github.com/mui/base-ui) (`master`)                     | `@base-ui/react` and related Base UI packages under `packages/` in that monorepo                  |
| `.repos/vite-plus`       | [voidzero-dev/vite-plus](https://github.com/voidzero-dev/vite-plus) (`main`) | `vite-plus`, `@voidzero-dev/vite-plus-core`, Oxlint/Oxfmt config, and `vp` CLI behavior           |

If `.repos/` is missing, run `pnpm setup` or `syncVendoredRepos({})` before relying on vendored source. Do not treat vendored trees as editable forks unless the task explicitly requires upstream contributions.
