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

## Repository layout

| Package      | Description                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `web`        | **TanStack Start app** (Vite + Nitro, React 19, Tailwind v4). The Next.js migration target. See [`web/README.md`](./web/README.md). |
| `app`        | Legacy Next.js app, kept runnable until the `web` cutover is verified.                                                              |
| `worker`     | Discord bot + crawler.                                                                                                              |
| `packages/*` | Shared `server` (tRPC router), `db`, `bhapi`, `web-parser`, `common`, `ui`, `logger` packages.                                      |

## Tooling

The workspace is built and checked with [Vite+](https://viteplus.dev), which
replaces the previous Turborepo + ESLint + Prettier setup with a single
toolchain:

| Concern     | Before                        | Now                                                  |
| ----------- | ----------------------------- | ---------------------------------------------------- |
| Task runner | Turborepo (`turbo.json`)      | Vite Task (`vp run`, configured in `vite.config.ts`) |
| Linting     | ESLint (`.eslintrc.yml`)      | Oxlint (`vp lint`, `lint` block)                     |
| Formatting  | Prettier (`.prettierrc`)      | Oxfmt (`vp fmt`, `fmt` block)                        |
| Checks      | separate `lint`/`format` runs | `vp check` (format + lint in one pass)               |
| Git hooks   | —                             | `vp staged` (opt in with `vp hooks enable`)          |

All lint, format and task configuration lives in the root `vite.config.ts`.

```sh
pnpm ci:install    # vp install --frozen-lockfile
pnpm dev           # vp run -r --parallel dev (all packages)
vp dev             # built-in dev server for ./web (see defaultPackage)
pnpm build         # vp run -r build
pnpm check         # vp check — format + lint the whole workspace
pnpm lint          # vp lint --fix
pnpm ts:check      # vp run -r ts:check (per-package, incl. @effect/tsgo)
pnpm ci:lint       # vp lint (no fixes; used in CI)
```

### Notes and follow-ups

- **Type-aware linting is off.** Vite+ recommends `typeAware: true` +
  `typeCheck: true`, but tsgolint (TypeScript 7) rejects the legacy
  `app`/`worker` tsconfigs (`es5`, `moduleResolution: node10`,
  `downlevelIteration`, `baseUrl`-relative `paths`), and `web` must be checked
  by the Effect-patched compiler. Types are checked per package by
  `pnpm ts:check` instead. Enable both once those tsconfigs are modernized.
- **95 lint warnings** remain (mostly `react/no-unstable-nested-components`,
  `no-underscore-dangle`, `react/function-component-definition` and
  `react/set-state-in-effect`). They are demoted to warnings so the migration
  lands green; fix them and the rules can become errors.
- **Commit hooks are not installed.** `staged` in `vite.config.ts` and
  `.vite-hooks/pre-commit` are committed and ready; run `vp hooks enable` (or
  add `vp config` to a `prepare` script) to activate them, and
  `vp hooks disable` to opt out in a clone.
