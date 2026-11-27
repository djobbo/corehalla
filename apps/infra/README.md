# Infra

The whole Cloudflare deployment: `alchemy.run.ts` is the only Alchemy
entrypoint. It declares the `Corehalla` stack — the D1 databases, the media
bucket, the KV cache, the crawl queues, the API and crawler Workers, the
web-next site, the CMS and the Storybook catalogue — for one stage at a time.

Every repo path resolves from the repository root
(`path.resolve(import.meta.dirname, "../..")`), so `alchemy plan` / `deploy`
declare the same resources whether they run from the repo root or from this
directory.

## Stages

`ALCHEMY_STAGE` selects the stage (`--stage` overrides it). Prod and dev share
one Cloudflare account and one zone, so only prod may use the bare resource
names: every other stage is suffixed `-dev`. That keeps the two stages from
adopting or deleting each other's data.

| Branch         | Stage  | Site                        | Cloudflare resources                   |
| -------------- | ------ | --------------------------- | -------------------------------------- |
| `feat/rewrite` | `dev`  | `https://dev.corehalla.com` | `-dev` suffixed, empty database        |
| `next` (later) | `dev`  | `https://dev.corehalla.com` | same dev resources                     |
| `main` (later) | `prod` | `https://corehalla.com`     | today's names, adopted on first deploy |

`SITE_URL` names the environment and every host hangs off it:
`dev.corehalla.com` also implies `cms.dev.corehalla.com` and
`ui.dev.corehalla.com`. Prod defaults to `https://corehalla.com` when the
variable is absent; every other stage **must** set it, because silently
inheriting the production host would take the production DNS record.

The zone and its custom-firewall ruleset are declared only for prod. The zone
has a single `http_request_firewall_custom` entrypoint, so the prod ruleset
carries the CMS skip rule for both `cms.corehalla.com` and
`cms.dev.corehalla.com`; neither the zone nor the ruleset is part of a dev
deploy.

`IMPORT_SUPABASE_SEED=1` stays off in dev: that dump is a copy of production.
Only prod and the local simulator may replay it. The import bookkeeping is keyed
by the path string the stack passes, and those paths are absolute now, so an
existing prod database would see every seed file as new: keep the flag off on the
first prod deploy and import by hand if the data is needed.

## Local

The repo-root `.env` holds the config (see `.env.example`). The root scripts
pass it through `--env-file`, so the stack and the website build children read
the same values:

```sh
vp run deploy                                  # vp run -F @crh/infra deploy --env-file "$PWD/.env"
vp run destroy
vp run -F @crh/infra plan --env-file ../../.env
```

`plan` is read-only and is the safe way to see what a deploy would do. Set the
stage explicitly — the CLI's per-user default (`live_$USER`) is not one of this
stack's environments:

```sh
ALCHEMY_STAGE=dev SITE_URL=https://dev.corehalla.com vp run -F @crh/infra plan --env-file ../../.env
```

`vp run dev` (`alchemy dev`, from the root) runs the same program against the
local simulator rather than Cloudflare.

## CI

`.github/workflows/deploy-dev.yml` deploys stage `dev` on every push or merge
to `feat/rewrite`, after install, `vp run check`, `vp run -r ts:check` and
`vp run -r test` pass. It reads no `.env`: every value comes from the job
environment.

| Name                                                                      | Scope                     | Kind      |
| ------------------------------------------------------------------------- | ------------------------- | --------- |
| `CLOUDFLARE_API_TOKEN`                                                    | repo                      | secret    |
| `DISCORD_CLIENT_SECRET`                                                   | repo                      | secret    |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE`, `DISCORD_CLIENT_ID`, `VITE_*` | repo                      | variables |
| `SITE_URL`                                                                | `development` environment | variable  |

`VITE_BUILD_ID` is stamped from `github.sha` in the workflow, not stored.
`concurrency: deploy-dev` queues a second push behind a running deploy instead
of cancelling it, because cancelling a half-applied deploy leaves the stack in
between.

## State store

`Cloudflare.state()` keeps one state-store Worker plus Secrets Store entries in
the account, keyed by stack and stage, so dev and prod share it. Bootstrap it
once, from a machine logged into the Alchemy profile, before the first deploy:

```sh
cd apps/infra
vp exec alchemy state bootstrap --env-file ../../.env
```

CI then reads and updates that existing store instead of creating one on its
first run; `CLOUDFLARE_API_TOKEN` needs `Workers Scripts: Edit` (which uploads
the temporary edge-preview Worker `state()` reads its bearer token from) and
`Secrets Store: Edit` for that read.

`alchemy destroy` never runs from CI, and no workflow destroys a stage on
merge. Tear-down is a deliberate, local, human action.
