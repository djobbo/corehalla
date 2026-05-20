# Vendored repositories (local shallow clones)

Upstream library monorepos live under `.repos/<name>` as **local-only shallow git clones** (one commit of history per repo). They are listed in `.gitignore` and are **not** committed to this repository.

Use them when you want upstream source, tests, and bundled docs available for implementation and debugging **without** bloating the main repo history.

## Local source of truth (`.repos`)

Trees under `.repos/<name>` are the **authoritative local copy** for how we reason about those upstream projects in _this_ repo. When you implement against, debug, or document behavior of a vendored library or service (for example Effect from `effect-smol`, TanStack Router, TanStack Query, Supabase, or Base UI), **prefer reading and citing the code and bundled docs inside `.repos`** over guessing from npm types, third-party summaries, or stale web pages. Treat each prefix as the canonical reference for that dependency until you refresh it with `syncVendoredRepos`.

Configured repos (see `VENDORED_REPOS` in [scripts/sync-vendored-repos.mts](../scripts/sync-vendored-repos.mts)):

| Prefix                   | Upstream                                                                | Branch   |
| ------------------------ | ----------------------------------------------------------------------- | -------- |
| `.repos/effect`          | [Effect-TS/effect-smol](https://github.com/Effect-TS/effect-smol)       | `main`   |
| `.repos/tanstack-router` | [TanStack/router](https://github.com/TanStack/router)                   | `main`   |
| `.repos/tanstack-query`  | [TanStack/query](https://github.com/TanStack/query)                     | `main`   |
| `.repos/supabase`        | [supabase/supabase](https://github.com/supabase/supabase)               | `main`   |
| `.repos/base-ui`         | [mui/base-ui](https://github.com/mui/base-ui)                           | `master` |
| `.repos/vite-plus`       | [voidzero-dev/vite-plus](https://github.com/voidzero-dev/vite-plus)     | `main`   |
| `.repos/drizzle-orm`     | [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) | `main`   |
| `.repos/kubi`            | [djobbo/kubi](https://github.com/djobbo/kubi)                           | `main`   |
| `.repos/alchemy`         | [alchemy-run/alchemy](https://github.com/alchemy-run/alchemy)           | `main`   |

## Prerequisites

- **Git** installed and on your `PATH`.
- After cloning this repo, run **`vp run setup`** (or call `syncVendoredRepos` yourself) so `.repos/` is populated before you rely on vendored source.

## Syncing (`syncVendoredRepos`)

Sync logic lives in [scripts/sync-vendored-repos.mts](../scripts/sync-vendored-repos.mts) and is exported as `Effect.fn("syncVendoredRepos")`.

It runs automatically as a step in [scripts/setup.mts](../scripts/setup.mts) after `vp install`.

| Option                   | Behavior                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `force: false` (default) | Clone any **missing** repos; **fetch + reset** existing shallow clones to the latest upstream branch tip. |
| `force: true`            | **Delete** each configured repo path under `.repos/`, then re-clone from scratch.                         |

Clones use `git clone --depth 1 --single-branch` so each tree has a single squashed snapshot (no full upstream history on disk).

### Refresh after `vp run setup`

Re-run setup, or invoke the function directly (example with `force: false`):

```bash
vp exec tsx -e "
import * as NodeRuntime from '@effect/platform-node/NodeRuntime'
import * as NodeServices from '@effect/platform-node/NodeServices'
import * as Effect from 'effect/Effect'
import * as Logger from 'effect/Logger'
import { syncVendoredRepos } from './scripts/sync-vendored-repos.mts'

const logger = Logger.withLeveledConsole(Logger.make((o) => String(o.message)))
NodeRuntime.runMain(
  syncVendoredRepos({ force: false }).pipe(
    Effect.provide(Logger.layer([logger])),
    Effect.provide(NodeServices.layer),
  ),
)
"
```

Use `{ force: true }` when a clone is corrupted or you need a clean re-download.

## Add a repository

1. Add an entry to `VENDORED_REPOS` in [scripts/sync-vendored-repos.mts](../scripts/sync-vendored-repos.mts) (`name`, `url`, `branch`).
2. Update the table in this file and in [AGENTS.md](../AGENTS.md).
3. Run `syncVendoredRepos({})` (via `vp run setup` or the snippet above) to clone into `.repos/<name>`.

Convention for `name`: short slug matching the upstream project (example: `effect` → `.repos/effect`).

## Notes

- `.repos/` is **gitignored**; only the sync script and docs are tracked.
- Each clone is a normal git working tree (`.git` inside the prefix); do not treat vendored trees as editable forks unless the task explicitly requires upstream contributions.
- Cursor and agents read vendored files from disk like any other workspace path; they do not need to be committed.
