# Agent guidance

## Vendored upstream (`.repos`)

Trees under `.repos/` are **squashed git subtrees** of upstream repositories. They are the **source of truth** in this repo for how we implement, debug, and document behavior of the matching installed dependencies.

When working on code that uses these libraries:

1. **Read and cite** the vendored tree first — package source, tests, examples, migration notes, and bundled docs inside `.repos` — instead of guessing from npm types alone, third-party summaries, or stale web pages.
2. **Follow patterns** shown in upstream examples and tests in the vendored tree unless this project documents an intentional deviation.
3. **Refresh** vendored copies with `git subtree pull` when you need newer upstream behavior (see [.plans/vendored-repo-git-subtree.md](.plans/vendored-repo-git-subtree.md)).

| Prefix | Upstream | Use for npm packages |
| --- | --- | --- |
| `.repos/effect` | [Effect-TS/effect-smol](https://github.com/Effect-TS/effect-smol) (`main`) | `effect` and related Effect v4 packages from that monorepo |
| `.repos/tanstack-router` | [TanStack/router](https://github.com/TanStack/router) (`main`) | `@tanstack/react-router`, `@tanstack/react-start`, and their workspace siblings in that monorepo |

Subtree imports are normal tracked files; there is no nested `.git` under these prefixes. Do not treat vendored trees as editable forks unless the task explicitly requires upstream contributions.
