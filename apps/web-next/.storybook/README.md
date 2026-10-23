# Component system & Storybook

`web-next` is built as a layered component system. The tiers are about
**composition**, not chemistry: every artifact states what it is built from and
what it is built for. Storybook's sidebar is that taxonomy.

| Tier        | Folder                      | What lives here                                                     | Story title                |
| ----------- | --------------------------- | ------------------------------------------------------------------- | -------------------------- |
| Foundations | `src/styles/app.css`        | Tokens: colour, type, shadow, radius, spacing                       | `Foundations/…`            |
| Components  | `src/components/ui/*`       | shadcn/Base UI primitives. No app imports, no data                  | `Components/<Name>`        |
| Patterns    | `src/components/common/*`   | App-agnostic compositions of primitives                             | `Patterns/<Name>`          |
| Patterns    | `src/components/charts/*`   | Data-visualisation compositions                                     | `Patterns/<Name>`          |
| Features    | `src/components/<domain>/*` | Domain-aware leaves (`player`, `clan`, `news`, `account`, `layout`) | `Features/<Domain>/<Name>` |
| Views       | `src/components/views/*`    | Route-level compositions; take data as props                        | `Views/<Name>`             |

Rules of the tiers:

- **`ui/` does not import from anywhere outside `ui/`.** It is the bottom of the
  graph; keeping it dependency-free is what lets the primitives be storied,
  consumed and eventually extracted without dragging the app along.
- **A lower tier never imports a higher one.** `common/` may use `ui/`; `views/`
  may use everything; nothing imports a `view`.
- **Data enters at the leaves as props.** Views receive already-shaped data, so a
  story is just props — no network, no Effect runtime, no router except where a
  component renders `<Link>`.

## Writing a story

Stories live beside the component as `<name>.stories.tsx`. One file per
component module, `title` per the table above.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { MyComponent } from "./MyComponent"

const meta = {
    title: "Patterns/My component",
    component: MyComponent,
    parameters: { layout: "padded" },
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: {/* … */} }
```

### Needing a router

A component that renders `<Link>` (directly or through `EntityLink`) needs the
`withRouter` decorator. It provides a real TanStack Router context without
rendering any route:

```tsx
import { withRouter } from "@/storybook/decorators"

const meta = {
    title: "Views/My view",
    component: MyView,
    decorators: [withRouter],
} satisfies Meta<typeof MyView>
```

The decorator registers every path under `src/routes`; a `to` the app does not
ship still fails, which is intentional.

### Needing an API

`AccountControl`, `FavoriteButton`, `FavoritesGrid`, `HoverPreview`/`EntityPreview`
and `Search` read from the Effect atom registry, which fetches `/api/v1/*`.
Story them with the `withMockApi` decorator (see `src/storybook/decorators.tsx`).
It provides a fresh registry, a Suspense boundary, and canned responses for the
account reads, and **falls through** for anything else — so stories compose.

A component that needs a profile, guild or esports payload declares it on the
story's own `parameters.mockApi`, so the routes travel with the story and no
import order can leave them unregistered:

```tsx
import { withMockApi } from "@/storybook/decorators"
import { playerMock } from "@/storybook/fixtures"

const meta = {
    title: "Features/Player/Player header",
    component: PlayerHeader,
    decorators: [withMockApi],
    parameters: { mockApi: playerMock },
} satisfies Meta<typeof PlayerHeader>
```

`src/storybook/fixtures.ts` is the fixture source of truth; failures that drive
an asset lookup (legend `name_key`, weapon `name`) must match the real filename
casing.

## Global setup

`.storybook/preview.tsx` wraps every story in the app shell: the Corehalla canvas
colour, Montserrat, and the `TooltipProvider` `__root.tsx` provides. It imports
`src/styles/app.css`, so stories are skinned by the real tokens — never by
Storybook-local CSS.

`.storybook/vite.config.ts` is a stripped twin of the app's Vite config (React +
Tailwind, no TanStack Start) and is selected by `.storybook/main.ts` via
`builder.viteConfigPath`, so the app's router plugin is never loaded in the
workshop.
