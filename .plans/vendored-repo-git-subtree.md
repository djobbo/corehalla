# Vendored repositories via squashed `git subtree`

Use this when you want upstream code (for example a separate **docs** site repo, or a library monorepo) inside this project **without** carrying the full upstream history—only periodic squashed imports.

## Local source of truth (`.repos`)

Trees under `.repos/<name>` are the **authoritative local copy** for how we reason about those upstream projects in _this_ repo. When you implement against, debug, or document behavior of a vendored library or service (for example Effect from `effect-smol`, or Dokploy’s server/API surface), **prefer reading and citing the code and bundled docs inside `.repos`** over guessing from npm types, third-party summaries, or stale web pages. Treat each prefix as the canonical reference for that dependency until you refresh it with `git subtree pull`.

Currently tracked:

| Prefix                    | Upstream                                                                    | Branch    |
| ------------------------- | --------------------------------------------------------------------------- | --------- |
| `.repos/effect`           | [Effect-TS/effect-smol](https://github.com/Effect-TS/effect-smol)           | `main`    |
| `.repos/tanstack-router`  | [TanStack/router](https://github.com/TanStack/router)                       | `main`    |
| `.repos/supabase`         | [supabase/supabase](https://github.com/supabase/supabase)                   | `master`  |

## Prerequisites

- This directory must be a **git repository** with at least one commit on the current branch (use `git commit --allow-empty -m "Initial commit"` if the tree is otherwise empty).
- Pick a **prefix** path where the subtree will live. Existing convention: `.repos/<short-name>` (example: `.repos/effect` for [effect-smol](https://github.com/Effect-TS/effect-smol)). For a documentation-only repo, `.repos/docs` is a reasonable choice.

## Add a repository (squashed, no upstream history)

Replace the URL, branch, and prefix as needed.

```bash
git subtree add --prefix=.repos/docs https://github.com/OWNER/REPO-NAME main --squash
```

- `--prefix` — directory that will contain the cloned tree; Git creates it.
- Last argument before `--squash` — upstream branch (often `main` or `master`).
- `--squash` — produces a single “squashed” commit for the imported tree instead of replaying every upstream commit.

Resulting history will look like: one commit that merges the squashed import into your branch.

## Update from upstream (squashed)

When you want to pull newer commits from the same repo and branch:

```bash
git subtree pull --prefix=.repos/docs https://github.com/OWNER/REPO-NAME main --squash
```

Resolve any merge conflicts if they appear, then commit as usual.

## Optional: shortcut with a named remote

```bash
git remote add docs-upstream https://github.com/OWNER/REPO-NAME
git subtree pull --prefix=.repos/docs docs-upstream main --squash
```

## Notes

- Subtree imports are **normal files** in your repo; there is no nested `.git` inside the prefix.
- Document the chosen **URL**, **branch**, and **prefix** in your team’s onboarding or runbook so future updates use the same values.
- Keep the **Local source of truth** table above in sync whenever you add or rename a subtree under `.repos`.
- For pushing changes _back_ to the upstream repo, `git subtree split` is possible but uncommon for read-only vendoring; treat the subtree as imported unless you intentionally maintain a fork workflow.
