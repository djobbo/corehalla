<p align="center">
  <a href="https://corehalla.com">
    <img src="./app/public/images/Corehalla_Logo.gif" height="128">
    <h1 align="center">Corehalla</h1>
  </a>
  <p align="center">
  View official rankings, player and clan stats, or find a community, and join the fight!
  </p>
</p>
<p align="center">
    <a aria-label="Corehalla Website" href="https://corehalla.com" target="_blank">
        <img alt="" src="https://img.shields.io/website.svg?url=http%3A%2F%2Fcorehalla.com&style=for-the-badge&labelColor=202020&label=Corehalla">
    </a>
    <a aria-label="License" href="https://github.com/djobbo/corehalla/blob/master/LICENSE.md" target="_blank">
        <img alt="" src="https://img.shields.io/github/license/djobbo/corehalla.svg?style=for-the-badge&labelColor=202020">
    </a>
    <a aria-label="Corehalla Discord" href="https://discord.com/invite/eD248ez" target="_blank">
        <img alt="" src="https://img.shields.io/badge/Join%20the%20discord-5865F2.svg?style=for-the-badge&logo=Discord&labelColor=202020&logoWidth=20&logoColor=white">
    </a>
    <a aria-label="Corehalla Twitter" href="https://twitter.com/Corehalla" target="_blank">
        <img alt="" src="https://img.shields.io/badge/Follow-1DA1F2.svg?style=for-the-badge&logo=Twitter&labelColor=202020&logoWidth=20&logoColor=white">
    </a>
</p>

## Local development

Corehalla is a [pnpm](https://pnpm.io/) monorepo managed with [Vite+](https://viteplus.dev/) (`vp`). You run the web app and worker on your machine; [Supabase CLI](https://supabase.com/docs/guides/cli) starts Postgres, Auth, REST, and Studio in Docker.

### Prerequisites

- **Node.js** `>=22.12.0` (see `engines` in `package.json`)
- **Vite+** (`vp`) — installs and uses **pnpm** `11.1.3` from `packageManager` in `package.json`
- **Docker** (for local Supabase)
- **Supabase CLI** — installed automatically as a dev dependency; use `vp exec supabase` or the `vp run services:*` scripts

### First-time setup

From the repo root:

```bash
cp .env.example .env
# Edit .env: BRAWLHALLA_API_KEY, DISCORD_AUTH_CLIENT_ID, DISCORD_AUTH_SECRET, etc.

vp run setup
```

`vp run setup` starts Supabase, writes API keys and `DATABASE_URL` into `.env`, installs dependencies, and runs Prisma migrations plus Supabase setup SQL in `packages/db`.

Then start the app and worker:

```bash
vp run dev
```

### Daily workflow

```bash
vp run services:up   # start Supabase if it is not already running
vp run dev
```

| Service           | URL                    |
| ----------------- | ---------------------- |
| Web app           | http://localhost:3000  |
| Supabase API      | http://127.0.0.1:54321 |
| Supabase Studio   | http://127.0.0.1:54323 |
| Worker API        | http://localhost:3002  |
| Postgres (direct) | `127.0.0.1:54322`      |

### Useful commands

| Command                          | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `vp run dev`                     | Start app and worker in watch mode                                   |
| `vp run setup`                   | Start Supabase, sync `.env`, install deps, migrate database          |
| `vp run services:up`             | `supabase start`                                                     |
| `vp run services:down`           | `supabase stop`                                                      |
| `vp run services:status`         | `supabase status`                                                    |
| `vp run db:migrate`              | Apply migrations and Supabase setup SQL                              |
| `vp run -r build`                | Build all workspace packages (dependency order)                      |
| `vp run -r ts:check`             | Typecheck all packages with `tsc` (optional; `vp check` covers this) |
| `vp check`                       | Format, lint, and typecheck the repo (also runs on commit)           |
| `vp run --filter app dev:prod`   | App with production-style public config                              |
| `vp run --filter worker bot:dev` | Worker with Discord bot only (crawler off)                           |

Reset local database data: `vp exec supabase db reset` (destroys local Postgres data).

### Commit hooks

`vp install` runs `vp config`, which wires Git to `.vite-hooks/`. The pre-commit hook runs `vp staged` (format + lint with auto-fix on staged files per `vite.config.ts`). Run `vp config` again if hooks are missing after clone.

### Optional configuration

- **`BRAWLHALLA_API_KEY`** — Required for live Brawlhalla API data (see `.env.example`).
- **Discord OAuth** — Set `DISCORD_AUTH_CLIENT_ID` and `DISCORD_AUTH_SECRET` in `.env`. In the [Discord Developer Portal](https://discord.com/developers/applications), set the redirect URL to `http://127.0.0.1:54321/auth/v1/callback` (Supabase local API; previously `http://localhost:8000/auth/v1/callback` with the old Compose stack).
- **Discord worker** — Copy `worker/.env.example` to `worker/.env` for manager-bot tokens; root `.env` is loaded first, then `worker/.env` overrides.

Environment variables are loaded from the repo root `.env` (Vite `envDir`, worker `dotenv`, and `dotenv-cli` for `vp run dev` / `vp run db:migrate`).
