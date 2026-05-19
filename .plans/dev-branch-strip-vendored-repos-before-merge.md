# Strip `.repos/` from `dev` before merging to `main`

Use this when feature work lives on a **`dev` branch that includes vendored subtrees** under `.repos/`, while **`main` must never receive those blobs** in its history.

Related: [vendored-repo-git-subtree.md](vendored-repo-git-subtree.md) (how to add and update subtrees).

## Branch model

| Branch | `.repos/` in commits | Merges into |
| ------ | -------------------- | ----------- |
| `main` | Never                | —           |
| `dev`  | Allowed during work  | `main` (after strip, below) |
| `vendor` (optional) | Subtree add/pull only | **Never** `main` |

During development, commit app changes and vendored trees on `dev` as needed. **Do not merge `dev` → `main` until `.repos/` has been removed from every commit on `dev`.**

Deleting `.repos/` in a final commit on `dev` is **not** sufficient: merging still brings earlier commits that added the large trees.

## Prerequisites

- [git-filter-repo](https://github.com/newren/git-filter-repo) installed (`pip install git-filter-repo` or your distro package).
- A **clean working tree** on `dev` (commit or stash local changes first).
- Coordinate with anyone else using `origin/dev` — this rewrites history and requires a force push.

## Pre-merge checklist (on `dev`)

1. Feature work on `dev` is complete and reviewed.
2. CI is green on the current `dev` tip (optional but recommended **before** rewrite).
3. Note the remote URL if you use a fresh clone for filtering (`git remote get-url origin`).

## Strip `.repos/` from `dev` history

Run from a clone of the repo (a fresh clone is safest; filtering is destructive).

```bash
git fetch origin
git checkout dev
git pull origin dev

# Remove the entire .repos/ prefix from every commit reachable on dev
git filter-repo --path .repos/ --invert-paths --force
```

`git filter-repo` removes remotes by default. Re-add and force-push:

```bash
git remote add origin <REMOTE_URL>
git push --force-with-lease origin dev
```

### Drop only one vendored tree

To keep other subtrees on `dev` but remove one prefix (example: Supabase only):

```bash
git filter-repo --path .repos/supabase --invert-paths --force
git remote add origin <REMOTE_URL>
git push --force-with-lease origin dev
```

### Shrink local `.git` after filtering (optional)

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Merge into `main`

After `origin/dev` has been rewritten:

```bash
git checkout main
git pull origin main
git merge dev
# resolve conflicts if any
git push origin main
```

Or open a PR from `dev` → `main`; the PR diff should show **no** `.repos/` paths.

## Verify before and after

**Confirm `dev` no longer contains vendored paths in history:**

```bash
git checkout dev
git log --oneline -- .repos/    # should be empty
ls .repos/ 2>/dev/null || echo "no .repos on disk"
```

**Confirm the merge will not reintroduce blobs** — on `main` after merge:

```bash
git log --oneline -- .repos/    # should still be empty
```

## Recovery and local vendoring

- **Remote `dev` after force-push:** collaborators must `git fetch origin` and `git reset --hard origin/dev` (or re-clone). Open PRs from old `dev` SHAs need to be recreated or rebased.
- **Keep vendored trees locally** without committing to `dev`/`main`:
  - Maintain a separate `vendor` branch with subtree add/pull only, never merged to `main`, or
  - Re-run `git subtree add` / `git subtree pull` locally when needed (see [vendored-repo-git-subtree.md](vendored-repo-git-subtree.md)).
- **If `main` already contains `.repos/`** from an accidental merge, rewrite `main` with the same `filter-repo` steps (higher coordination cost) — prefer stripping `dev` *before* the first merge.

## Quick reference

```bash
# When dev is ready for main:
git checkout dev && git pull origin dev
git filter-repo --path .repos/ --invert-paths --force
git remote add origin <REMOTE_URL>
git push --force-with-lease origin dev
git checkout main && git pull origin main && git merge dev && git push origin main
```
