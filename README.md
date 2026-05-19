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

Corehalla is a [pnpm](https://pnpm.io/) monorepo. Local dev runs the web app and background worker against a self-hosted [Supabase](https://supabase.com/) stack (Postgres, Auth, REST, and Studio) via Docker.

### Prerequisites

- **Node.js** `>=22.12.0` (see `engines` in `package.json`)
- **pnpm** `8.5.0` (`corepack enable` is enough to match `packageManager`)
- **Docker** and Docker Compose (for the database and Supabase services)

### Dev Container (recommended)

The repo includes a [Dev Container](https://containers.dev/) under `.devcontainer/` that starts Supabase and wires environment variables for you.

1. Open the repository in VS Code or Cursor and choose **Reopen in Container**.
2. On first start, the container runs `pnpm ci:install` and `pnpm setup:env` (installs dependencies and applies database migrations once Postgres is up).
3. From the repo root, start the app and worker:

   ```bash
   pnpm dev
   ```

| Service | URL |
| --- | --- |
| Web app | http://localhost:3000 |
| Supabase Studio | http://localhost:3001 |
| Worker API | http://localhost:3002 |

### Manual setup (host machine)

Use this if you are not using the Dev Container.

1. **Environment** — Copy the example env file and adjust secrets as needed:

   ```bash
   cp .devcontainer/.env.example .devcontainer/.env
   ```

   Set `ENV_FILE=.env` in `.devcontainer/.env` so Compose picks up your file (the example documents this).

   For commands run on your host (not inside Docker), export at least `DATABASE_URL` and the `NEXT_PUBLIC_*` / Supabase variables from the same file. Use `localhost` as the database host, for example:

   ```bash
   export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres"
   ```

2. **Start Supabase** — From `.devcontainer/`:

   ```bash
   docker compose up -d
   ```

3. **Install and migrate** — From the repo root:

   ```bash
   pnpm install
   pnpm db:migrate
   ```

   `db:migrate` runs Prisma migrations and Supabase setup SQL in `packages/db`.

4. **Run dev servers**:

   ```bash
   pnpm dev
   ```

   This runs `app` (Vite on port 3000) and `worker` (port 3002) in parallel via Turborepo.

### Useful commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start app and worker in watch mode |
| `pnpm setup:env` | Install deps and retry migrations until the database is ready (used by the Dev Container) |
| `pnpm db:migrate` | Apply migrations and Supabase setup locally |
| `pnpm --filter app dev:prod` | Run the app against production-style public config |
| `pnpm --filter worker bot:dev` | Worker with Discord bot only (crawler disabled) |

### Optional configuration

- **`BRAWLHALLA_API_KEY`** — Required for live Brawlhalla API data (see `.devcontainer/.env.example`).
- **Discord worker** — Copy `worker/.env.example` to `worker/.env` if you need the Discord manager bot locally; the worker `dev` script enables the bot and crawler by default.
- **Discord OAuth** — Set `DISCORD_AUTH_CLIENT_ID` and `DISCORD_AUTH_SECRET` in your env file for sign-in during local development.
