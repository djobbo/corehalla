## Workspace
Corehalla is using a [[monorepo folder structure]], using [Turborepo](https://turbo.build/) for caching and script dependencies management.
### Monorepo structure
- `app` -> [[app/README]]
	Code for the main website
- `packages` -> [[packages/README]]
	Common packages used by the different apps
- `worker` -> [[worker/README]]
	Leaderboard crawler, keeps db fresh with updated leaderboard data for queues/global rankings
- `docs` -> [[Corehalla]]
	[[Obsidian]] docs
### Tech stack
- Monorepo
	- [Turborepo](https://turbo.build/): Script dependency management 
	- [Eslint](https://eslint.org/): JS/TS Linting
	- [Prettier](https://prettier.io/): Prettify (integrated with eslint)

Corehalla is open source. View [[LICENSE]]

#readme #doc
