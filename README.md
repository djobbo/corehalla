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

Corehalla is a [pnpm](https://pnpm.io/) monorepo. You run the web app and worker on your machine; [Supabase CLI](https://supabase.com/docs/guides/cli) starts Postgres, Auth, REST, and Studio in Docker.

### Prerequisites

- **Node.js** `>=22.12.0` (see `engines` in `package.json`)
- **pnpm** `9.15.9` (`corepack enable` matches `packageManager`)
- **Docker** (for local Supabase)
- **Supabase CLI** — installed automatically as a dev dependency; use `pnpm exec supabase` or the `pnpm services:*` scripts

### First-time setup

From the repo root:

```bash
cp .env.example .env
# Edit .env: BRAWLHALLA_API_KEY, DISCORD_AUTH_CLIENT_ID, DISCORD_AUTH_SECRET, etc.

pnpm setup
```

`pnpm setup` starts Supabase, writes API keys and `DATABASE_URL` into `.env`, installs dependencies, and runs Prisma migrations plus Supabase setup SQL in `packages/db`.

Then start the app and worker:

```bash
pnpm dev
```

### Daily workflow

```bash
pnpm services:up   # start Supabase if it is not already running
pnpm dev
```

| Service | URL |
| --- | --- |
| Web app | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Supabase Studio | http://127.0.0.1:54323 |
| Worker API | http://localhost:3002 |
| Postgres (direct) | `127.0.0.1:54322` |

### Useful commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start app and worker in watch mode |
| `pnpm setup` | Start Supabase, sync `.env`, install deps, migrate database |
| `pnpm services:up` | `supabase start` |
| `pnpm services:down` | `supabase stop` |
| `pnpm services:status` | `supabase status` |
| `pnpm db:migrate` | Apply migrations and Supabase setup SQL |
| `pnpm --filter app dev:prod` | App with production-style public config |
| `pnpm --filter worker bot:dev` | Worker with Discord bot only (crawler off) |

Reset local database data: `pnpm exec supabase db reset` (destroys local Postgres data).

### Optional configuration

- **`BRAWLHALLA_API_KEY`** — Required for live Brawlhalla API data (see `.env.example`).
- **Discord OAuth** — Set `DISCORD_AUTH_CLIENT_ID` and `DISCORD_AUTH_SECRET` in `.env`. In the [Discord Developer Portal](https://discord.com/developers/applications), set the redirect URL to `http://127.0.0.1:54321/auth/v1/callback` (Supabase local API; previously `http://localhost:8000/auth/v1/callback` with the old Compose stack).
- **Discord worker** — Copy `worker/.env.example` to `worker/.env` for manager-bot tokens; root `.env` is loaded first, then `worker/.env` overrides.

Environment variables are loaded from the repo root `.env` (Vite `envDir`, worker `dotenv`, and `dotenv-cli` for `pnpm dev` / `pnpm db:migrate`).
