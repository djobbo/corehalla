# Corehalla CMS

EmDash CMS for Corehalla editorial content and media. It runs as a separate Astro app and is read by the API through a service binding (production) or `http://localhost:3002` (local).

## Content model

- `posts` — updates / articles
- `pages` — wiki pages
- `media_slots` — named images consumed by the website

The schema and initial settings live in `seed/seed.json` and are applied when the database is empty.

## Seeding

`seed/seed.json` can also carry starter entries under `"content"`. Image fields can use
`$media` to have EmDash download and store the file:

```json
{
    "id": "ranked-gold-3",
    "slug": "ranked-gold-3",
    "status": "published",
    "data": {
        "key": "ranked.banner.gold-3",
        "alt": "Gold 3 ranked banner",
        "image": {
            "$media": {
                "url": "https://example.com/gold-3.png",
                "alt": "Gold 3 ranked banner",
                "filename": "gold-3.png"
            }
        }
    }
}
```

Apply it to the local SQLite CMS:

```sh
vpr cms:seed
```

The equivalent command is:

```sh
cd apps/cms
vp exec emdash seed seed/seed.json \
    --database ./emdash.db \
    --uploads-dir ./data/uploads \
    --on-conflict=update
```

`--validate` checks the seed without writing. `--on-conflict=update` is useful when rerunning against
an existing database; the default is `skip`.

The automatic seed on first request only runs on an empty database. Use `vpr cms:seed` to apply
content to an existing local database.

For production, use the EmDash admin media/content editors, or authenticate the CLI and use
`emdash site export` / `emdash site import` or the remote `emdash media upload` and
`emdash content create` commands.

### Bundled media

The ranked banners, roster legend icons, and weapon icons under `apps/web/public/images` can be
uploaded and turned into media slots in one pass. Start the local CMS (`vpr dev`) and run:

```sh
vpr cms:seed:media
```

The script uploads the files through the EmDash API, creates published `media_slots`, and is
idempotent. Uploads run concurrently (default: 1 against local SQLite, 4 against a remote CMS).
Override with `EMDASH_CONCURRENCY`. Rerunning it updates every existing slot in place. If an image
file changes, the slot points at the new media item; the previous image is left in storage and is
not deleted. Slot keys are:

- `ranked.banner.<tier>` — e.g. `ranked.banner.gold-3`
- `legend.icon.<name_key>` — e.g. `legend.icon.sir-roland`
- `weapon.icon.<weapon>` — e.g. `weapon.icon.rocket-lance`

For a deployed CMS:

```sh
EMDASH_URL=https://cms.example.com EMDASH_TOKEN=... vpr cms:seed:media
```

## Local development

```sh
vpr dev
```

`vpr dev` starts the Alchemy stack and the CMS together. The CMS is available at:

- Admin: http://localhost:3002/_emdash/admin
- Dev sign-in: http://localhost:3002/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin
- Public API: http://localhost:3002/api/public/articles

Local data is stored in `apps/cms/emdash.db` and `apps/cms/data/`. Delete both to reset the CMS.

The local CMS uses Node, SQLite, and filesystem media (`astro.config.local.mjs`). Production uses Cloudflare D1 and R2 (`astro.config.mjs`).

## Production

```sh
vpr deploy
```

- Admin: `https://cms.<SITE_URL host>/_emdash/admin`
- D1: `corehalla-emdash`
- R2: `corehalla-media`
- The API reads the CMS through the `CMS` service binding.

The first admin account is created with a passkey at the production admin URL. Media URLs are served through the CMS Worker and cached by Cloudflare.

The CMS Worker sets `EMDASH_SITE_URL` to its canonical `https://cms.<host>` origin. EmDash uses that for passkey origin verification, so setup does not depend on `X-Forwarded-Proto` behind a proxy.

Alchemy deploys this with `Cloudflare.Website.Astro`, which supplies the Cloudflare adapter. The app does not include EmDash's custom Worker entry, so scheduled publishing and sandboxed plugins are not wired up. Content, media, admin, and the public API all work normally.

## Public API

The API gateway consumes these CMS-local endpoints:

- `GET /api/public/articles?page=1&pageSize=12`
- `GET /api/public/articles/:slug`
- `GET /api/public/media`

`apps/api` validates/normalizes those responses through the `CMS` Effect service.
