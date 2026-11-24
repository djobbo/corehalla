---
name: Corehalla
description: Brawlhalla stats on a dark poster. Hard ink shadows, parallelogram chips, one Montserrat.
colors:
    canvas: "#1e212c"
    canvas-deep: "#1a1b23"
    card: "#2b3043"
    panel: "#232838"
    ink: "#0b0c12"
    foreground: "#ffffff"
    muted: "#ccd0d6"
    brand: "#3861fb"
    brand-bright: "#2095f2"
    brand-deep: "#2440b8"
    brand-alt: "#e568d9"
    brand-alt-bright: "#ff99e9"
    success: "#24cd7c"
    danger: "#ed7853"
    warning: "#f3da57"
    border: "rgb(11 12 18 / 0.55)"
typography:
    display:
        fontFamily: "Montserrat, sans-serif"
        fontSize: "3.75rem"
        fontWeight: 800
        lineHeight: 0.98
        letterSpacing: "-0.01em"
    headline:
        fontFamily: "Montserrat, sans-serif"
        fontSize: "1.5rem"
        fontWeight: 800
        lineHeight: 0.98
        letterSpacing: "-0.01em"
    title:
        fontFamily: "Montserrat, sans-serif"
        fontSize: "1.125rem"
        fontWeight: 800
        lineHeight: 0.98
        letterSpacing: "-0.01em"
    body:
        fontFamily: "Montserrat, sans-serif"
        fontSize: "0.875rem"
        fontWeight: 400
        lineHeight: 1.5
    label:
        fontFamily: "Montserrat, sans-serif"
        fontSize: "0.64rem"
        fontWeight: 800
        lineHeight: 1.2
        letterSpacing: "0.24em"
rounded:
    none: "0"
    sm: "0.15rem"
    md: "0.2rem"
    lg: "0.25rem"
    xl: "0.35rem"
    2xl: "0.45rem"
spacing:
    masthead: "3.5rem"
    nav: "2.5rem"
    page-inline: "1rem"
    page-block: "1.25rem"
    page-bottom: "4rem"
    column: "72rem"
    chip-gap: "0.375rem"
components:
    button-default:
        backgroundColor: "{colors.card}"
        textColor: "{colors.foreground}"
        rounded: "{rounded.none}"
        padding: "0 1.5rem"
        height: "2.5rem"
    button-default-hover:
        backgroundColor: "{colors.brand}"
        textColor: "{colors.foreground}"
        rounded: "{rounded.none}"
        padding: "0 1.5rem"
        height: "2.5rem"
    button-secondary:
        backgroundColor: "{colors.panel}"
        textColor: "{colors.foreground}"
        rounded: "{rounded.none}"
        height: "2.5rem"
    chip-on:
        backgroundColor: "{colors.brand}"
        textColor: "{colors.foreground}"
        padding: "0.28rem 0.7rem"
    chip-off:
        backgroundColor: "{colors.panel}"
        textColor: "{colors.muted}"
        padding: "0.28rem 0.7rem"
    input:
        backgroundColor: "{colors.canvas-deep}"
        textColor: "{colors.foreground}"
        rounded: "{rounded.none}"
        padding: "0.5rem 0.625rem"
        height: "2.5rem"
        typography: "{typography.body}"
---

# Design System: Corehalla

The source of truth is `apps/web-next/src/styles/app.css`. shadcn components in `apps/web-next/src/components/ui` supply structure, keyboard behaviour and ARIA. The stylesheet decides what their tokens mean, and it owns the shapes no kit ships: the parallelogram cut, the hard offset shadow, the sheared art tile. `apps/web` is the previous client. It shares these hex values under different names. Do not extend it.

## Overview

**Creative North Star: "The poster"**

The phrase is the stylesheet's own (`poster treatment`, `poster's slab`, `poster's bullet`). A page is a dark canvas with solid slabs lifted by an unblurred black offset, and small things cut as parallelograms so the layout leans without rotating the content. Type is one family, Montserrat, separated by weight, tracking and case. Numbers that change width use tabular figures.

There is no second theme. `dark:` utilities in the shadcn components are inert: nothing sets `.dark`. The page colour sits on `html`, not `body`, so the landing pattern (negative z-index) can show through the gaps. Cards are supposed to be opaque. See Open questions for where the component disagrees.

**Key Characteristics:**

- One blue (`{colors.brand}`). The shadcn token `accent` is not that blue.
- Shadows are hard offsets of `{colors.ink}`. No blur.
- Parallelograms for chips, ranks, progress and art tiles. Artwork stays upright inside the cut.
- Uppercase tracked labels for kickers, chips, tabs and table heads.
- One column, `{spacing.column}`.

## Colors

The palette is the same hexes the previous client shipped. `web-next` renames the blue family to `brand` because shadcn spends `accent` on the hover surface. Source: the `@theme` block and `:root` in `apps/web-next/src/styles/app.css`.

### Primary

- **Brand blue** (`{colors.brand}`): `--color-brand`, `--primary`, `--chart-1`. Filled chips (`.ch-chip-on`), the masthead mark, the nameplate, rank 3, progress default, selection.
- **Brand bright** (`{colors.brand-bright}`): `--color-brandVar1`, `--ring`, `--chart-2`. Focus ring, kicker, article links, rank 2. This is a text colour and a line colour. It is not a second brand.
- **Brand deep** (`{colors.brand-deep}`): `--color-brandDeep`. The hero plate (`.ch-hero`) and the alert bar. On this plate the kicker switches to `{colors.warning}`, because brand-bright sits on top of a blue field.

### Secondary

- **Brand alt** (`{colors.brand-alt}`): `--color-brandAlt`. The sixth series colour (`.ch-fill-pink`). Not a button colour.
- **Brand alt bright** (`{colors.brand-alt-bright}`): `--color-brandAltVar1`. Defined, barely used. Do not reach for it as a hover.

### Neutral

- **Canvas** (`{colors.canvas}`): `--background`, `--color-bgVar1`. The page. Painted on `html`.
- **Canvas deep** (`{colors.canvas-deep}`): `--color-bgVar2`, and shadcn `--accent`. The deepest well: scrollbar track, input fill, hover row, sticky-bar frost. `--accent` means "hovered surface", never "the blue".
- **Card** (`{colors.card}`): `--card`, `--popover`, `--color-bg`. A raised slab. The token is named `bg` and it is not the page. `bg-bg` paints a card, not the canvas.
- **Panel** (`{colors.panel}`): `--secondary`, `--muted`, `--color-panelDeep`. Inset wells, off chips, secondary buttons, the tab groove.
- **Ink** (`{colors.ink}`): `--color-ink`. Shadow colour, rank-1 text, the footer rule. Not a page background.
- **Foreground** (`{colors.foreground}`): `--foreground`, `--color-text`. Primary text.
- **Muted** (`{colors.muted}`): `--muted-foreground`, `--color-textVar1`. Secondary text. It clears 4.5:1 on canvas, card, panel and canvas-deep. It does not clear 4.5:1 on `{colors.brand}`.
- **Border** (`{colors.border}`): `--border` and `--input`. Ink at 55% opacity. Row rules and input edges, not a card outline.

### Status

- **Success** (`{colors.success}`): wins, `.ch-fill-green`, `--chart-3`.
- **Danger** (`{colors.danger}`): losses, `.ch-fill-orange`, `--destructive`, `--chart-4`. One colour, two token names.
- **Warning** (`{colors.warning}`): rank 1 fill, hero kicker, alert mark and link, `.ch-fill-yellow`, `--chart-5`. Pair it with `{colors.ink}` when it is a fill (rank 1 does).

**The One Blue Rule.** `{colors.brand}` is the only filled accent. `{colors.brand-bright}` is for lines, focus and kickers. `{colors.brand-alt}` is a series colour. shadcn `accent` / `bg-accent` is `{colors.canvas-deep}`.

**The Bg-Is-The-Slab Rule.** `--color-bg` is `{colors.card}`. The page is `--background` / `--color-bgVar1`.

## Typography

**Display / body / label:** Montserrat, loaded from `@fontsource/montserrat` at 400, 500, 600, 700, 800, 900. `--font-display`, `--font-sans` and `--font-heading` are the same stack. There is no second face. The file is `apps/web-next/src/styles/app.css`.

**Character:** Weight and tracking do the hierarchy. Display is 800, uppercase, tight leading. Labels are 800, uppercase, wide tracking. Body stays at 400 and sentence case.

### Hierarchy

- **Display** (800, `{typography.display.fontSize}` at the `sm` landing hero, line-height 0.98, tracking `-0.01em`, uppercase): `.ch-display`. The landing hero is `text-4xl` / `sm:text-6xl`. Do not use 3.75rem anywhere else.
- **Headline** (800, `{typography.headline.fontSize}`, same leading and tracking, uppercase): page titles on `.ch-hero`, player name at `text-2xl` / `sm:text-3xl`.
- **Title** (800, `{typography.title.fontSize}`, uppercase): section displays, clan name at `text-xl`, wordmark at `text-lg` with tracking overridden to `0.02em`.
- **Body** (400, `{typography.body.fontSize}`, leading 1.5): UI copy. Article body (`.ch-article`) is `0.95rem` at leading 1.75, in `{colors.muted}`, with foreground reserved for headings and `strong`. Measure stays near 65–75ch: article legal text caps at `46rem`, hero lede at `max-w-xl`.
- **Label** (800, `0.64rem`, tracking `0.24em`, uppercase): `.ch-kicker`, colour `{colors.brand-bright}`. Neighbours, same idea, different size: chips `0.7rem` / tracking `0.08em`; tabs and footer links `0.72rem` / `0.12em`; stat labels and table heads `0.6rem` / `0.12em` to `0.16em`, colour `{colors.muted}`.

**The Tabular Rule.** `.ch-stat-value` sets `font-variant-numeric: tabular-nums`. Stat columns, ratings and counts do the same with the `tabular-nums` utility. Labels do not.

**The Case Rule.** Kickers, chips, tabs, table heads, buttons and `.ch-display` are uppercase. Names, sentences and article body are not. Alias chips opt out with `normal-case`.

## Layout

One column. `.ch-page` is `width: 100%`, `max-width: {spacing.column}`, `margin-inline: auto`, padding `{spacing.page-block} {spacing.page-inline} {spacing.page-bottom}`. The footer inner column uses the same max width. Source: `.ch-page` and `.ch-footer-inner` in `app.css`. `72rem` is the width the stylesheet chose between a hemmed grid and a ladder that turns into empty corridor.

The sticky stack is three heights, all on `:root` in the base layer:

- `--ch-masthead-h`: `{spacing.masthead}` (`.ch-masthead`)
- `--ch-nav-h`: `{spacing.nav}` (`.ch-nav`), stuck at `top: var(--ch-masthead-h)`
- `--ch-header-h`: the sum. The ladder filter row sticks at `top: var(--ch-header-h)`.

Page rhythm below the hero is Tailwind's default scale, used at a few steps: section gaps `mt-8` (2rem), `mt-10` (2.5rem) and `mt-12` (3rem); landing ladders `gap-6`; catalogue grids `gap-3`; chip rows `gap-1.5` (`{spacing.chip-gap}`).

The intentional break is the overhang. `.ch-nameplate` pulls `1.65rem` past the card padding (`margin-left: -1.65rem`) and reserves `3rem` on the right for the ranked banner. `.ch-card-banner` hangs `0.32rem` off the top. Both stay inside the team grid's `gap-4`.

Catalogue grids go 1 / 2 / 3 columns (`sm` / `lg`). The landing ladders go one column, then two at `lg`. The section nav scrolls horizontally; it does not wrap.

## Elevation & Depth

Flat fills, separated by a hard unblurred offset of `{colors.ink}`. The stylesheet says so, and it enforces it by replacing Tailwind's shadow scale in `@theme`. There is no blurred drop shadow in that scale.

### Shadow Vocabulary

- **2xs / xs** (`2px 2px 0 0 {colors.ink}`): the two smallest steps are the same value.
- **sm** (`3px 3px 0 0`): buttons, the masthead mark, rank badges, chip `drop-shadow`, nameplate `drop-shadow`, card banner `drop-shadow`.
- **md** (`4px 4px 0 0`): dialogs, menus, the weekly-rotation plate.
- **lg** (`5px 5px 0 0`), **xl** (`6px 6px 0 0`), **2xl** (`8px 8px 0 0`): further off the page. A dialog is `shadow-md`, a step above a card's `shadow-sm`.

`clip-path` removes `box-shadow`, so cut shapes use `filter: drop-shadow` at the same offset. Sticky bars do not use this shadow. They use `color-mix(... 92%, transparent)` plus `backdrop-filter: blur(10px)`. The nav adds `box-shadow: 0 3px 0 0 {colors.ink}` as a rule under the bar. The page loader scrim is the same frost at 82% and `blur(8px)`.

**The Hard-Shadow Rule.** If a surface needs to lift, use the scale or a `drop-shadow` of `{colors.ink}` with no blur. Do not write a custom blurred shadow.

## Shapes

Corners on the token scale start at `--radius: 0.25rem` (`{rounded.lg}`) and step by the multipliers in `@theme inline` (`0.6`, `0.8`, `1`, `1.4`, `1.8`, `2.2`, `2.6`). Buttons, dialogs, inputs and menus set `rounded-none`. The parallelogram is not a radius.

The cut is `polygon(7px 0, 100% 0, calc(100% - 7px) 100%, 0 100%)` on `.ch-chip`. Art tiles (`.ch-thumb`) use the same idea with a `5px` slant, and the width is height plus slant so the top edge stays as long as the tile is tall. A skew is reserved for things that should lean as a whole: progress (`15deg`), rank badges (`-10deg`, counter-skewed glyph), the masthead mark (`-12deg`). Flags and faces are clipped, never skewed.

**The Upright-Art Rule.** `clip-path` on the frame, `transform: skew` only when the content is a glyph or a bar. A skewed portrait is broken, not styled.

## Components

### Buttons

Source: `apps/web-next/src/components/ui/button.tsx`. Square (`rounded-none`). Label is `text-xs`, weight 600, `tracking-widest`, uppercase.

- **Default:** fill `{colors.card}`, text `{colors.foreground}`, `shadow-sm`. Hover: translate `-1px -1px`, fill `{colors.brand}`, text `{colors.foreground}`. Press: translate `3px 3px`, `shadow-none`. The 3px press cancels the 3px shadow, so the slab sits flat while held.
- **Secondary:** fill `{colors.panel}`, hover fill `{colors.card}`. Same lift and press.
- **Outline:** transparent, `shadow-sm`, hover fill `{colors.card}`.
- **Ghost:** no shadow. Text `{colors.muted}`, hover fill `{colors.canvas-deep}`.
- **Destructive:** fill `{colors.danger}`, text `{colors.ink}`. Same lift and press. Do not put `{colors.foreground}` on this fill.
- **Link:** `{colors.brand}` with underline, offset `4px`.
- **Heights:** `xs` 1.75rem, `sm` 2.25rem, default 2.5rem, `lg` 2.75rem. Icon sizes match.

### Chips

Source: `.ch-chip` in `app.css`. Inline-flex, the 7px cut, `drop-shadow(3px 3px 0 {colors.ink})`. Hover lifts to `-1px -1px` and `4px` shadow. Press drops to `2px 2px` and `1px` shadow. Transition is `transform, filter, background-color, color` at `120ms ease`.

- **On:** `{colors.brand}` / `{colors.foreground}`.
- **Off:** `{colors.panel}` / `{colors.muted}`, hover fill `{colors.card}` and text `{colors.foreground}`.

Used as links (ladder bracket and region), toggles (tier floor, favourite) and static labels (aliases, news category).

### Cards / Containers

The slab the stylesheet describes: solid `{colors.card}`, hard shadow, no outline. `.ch-hero` is the page-title plate: fill `{colors.brand-deep}`, padding `0.9rem 1rem`, kicker in `{colors.warning}`.

The shadcn `Card` (`components/ui/card.tsx`) does not match that description yet. See Open questions.

Nameplate (`.ch-nameplate`): a `{colors.brand}` plate, flag or rank cap on the left, names at `0.875rem` / weight 600. Links are `{colors.foreground}`, hover `{colors.warning}`. The ranked banner (`.ch-card-banner`) is `4.5rem` wide, uncut, `drop-shadow(3px 3px 0 {colors.ink})`, `pointer-events: none`.

### Inputs / Fields

Source: `components/ui/input.tsx`, `textarea.tsx`, `select.tsx`. Fill `{colors.canvas-deep}`, text `{colors.foreground}`, placeholder `{colors.muted}`, height `2.5rem` (select `sm` is `2.25rem`), square. Invalid state draws `outline: 2px solid {colors.danger}`. The base layer also sets `:focus-visible { outline: 2px solid {colors.brand-bright}; outline-offset: 2px }`.

### Navigation

Masthead (`.ch-masthead`): sticky, height `{spacing.masthead}`, frost over `{colors.canvas-deep}`, the skewed mark, the wordmark, search, account. Section bar (`.ch-nav`): sticky under it, height `{spacing.nav}`, horizontal scroll, a 3px ink rule on the bottom. The markup is `components/layout/MainNav.tsx`, a menu of uppercase links at `0.7rem` / 800 / tracking `0.08em`, not chips. Active page sets `text-foreground` and `aria-current="page"`. Popouts are `{colors.card}` with `shadow-md`.

Tabs (`.ch-tabline` / `.ch-tablink`): a groove of `inset 0 -3px 0 0 {colors.panel}`. The active link scales a 3px `{colors.brand}` bar to full width (`150ms ease`). Hover shows 35% of that bar.

### Progress

`.ch-progress` and `.ch-progress-split` skew `15deg`. Colour is only `--ch-fill`, set by `.ch-fill-blue | cyan | green | orange | yellow | pink`. The rest slot (`.ch-progress-rest`) is a hollow 1.5px border, not another category. The page loader reuses `.ch-progress` and scales the fill (`scaleX`) so the blur behind it does not reflow.

### Empty

`components/ui/empty.tsx` centres its content. Call sites pair it with `rounded-2xl bg-card`. The landing signed-out prompt is a centred dashed well with a heart icon (`components/account/LandingFavorites.tsx`).

### Motion

Durations and curves that actually exist:

- Chips, links, tabs, footer links: `120ms ease` on colour. Tab underline: `150ms ease`.
- Buttons: `transition-all` (Tailwind's default 150ms), translate on hover and press.
- Dialogs, menus, hover cards: `duration-100`, fade plus zoom from 95%.
- Page loader enter: mark `420ms cubic-bezier(0.22, 1, 0.36, 1)` and opacity `200ms ease` delayed `40ms`. Exit: mark `scale(14)` at `520ms cubic-bezier(0.4, 0, 0.2, 1)`, scrim fades `320ms ease` delayed `200ms`.
- Loader bar: creeps to `scaleX(0.92)` over `22s` on `cubic-bezier(0.16, 0.5, 0.3, 1)`, then finishes `240ms ease-out`. It is a transition so a fast load can interrupt it.
- Masthead progress (`.ch-navprogress`): creeps to 90% over `12s` on the same curve, finishes `160ms ease-out`.
- Landing pattern: scroll parallax, skipped when `prefers-reduced-motion: reduce` matches (`components/layout/LandingBackground.tsx`).
- Logo centre: `ch-logo-spin`, `2s linear infinite`.

`prefers-reduced-motion` in `app.css` covers the loader mark and the logo spin only. The bar is left alone on purpose: the comment calls the fill information, not motion.

## Do's and Don'ts

These are the rules the stylesheet and the components already agree on.

### Do:

- **Do** lift a control with the hard ink shadow, and cancel it on press (`translate(3px, 3px)` against `shadow-sm`).
- **Do** cut chips, tiles and plates with `clip-path`. Keep flags and faces upright.
- **Do** put the page colour on `html`. Leave `body` transparent.
- **Do** set stat values and ladder numbers in `tabular-nums`.
- **Do** use `{colors.ink}` text on `{colors.warning}` and on `{colors.danger}` fills.
- **Do** switch the kicker to `{colors.warning}` on `{colors.brand-deep}`. Brand-bright disappears there.
- **Do** keep the filter row on `top: var(--ch-header-h)`. Do not hardcode `top-14`.

### Don't:

- **Don't** use shadcn `accent` or `bg-accent` for the brand blue. That token is `{colors.canvas-deep}`.
- **Don't** paint the page with `bg-bg` or `bg-card`. `bg-bg` is the slab.
- **Don't** add a blurred `box-shadow`. The scale was replaced so you would not.
- **Don't** skew a portrait, a flag or a weapon icon.
- **Don't** put `{colors.foreground}` on `{colors.danger}`. The destructive button uses `{colors.ink}`.
- **Don't** introduce a second typeface, a font CDN, or an icon set. Icons already come from `lucide-react`.
- **Don't** put a gradient on a slab. The landing mask is an alpha ramp, not a painted colour.

## Open questions

The code disagrees with itself here. Do not pick a winner in a drive-by edit.

1. **Radius.** Buttons, dialogs, inputs and menus are `{rounded.none}`. `Card`, catalogue links, news frames and empty states use `rounded-2xl` (`{rounded.2xl}`). `.ch-article` images use `border-radius: 0.75rem`, which is not on the scale.
2. **Card fill.** The stylesheet says slabs are opaque so the landing pattern shows through the gaps. `Card` sets `bg-card/50` and no shadow (`components/ui/card.tsx`). The player header card sets `bg-transparent shadow-none`.
3. **Section nav.** The `.ch-nav` comment describes parallelogram chips. `MainNav.tsx` renders a text menu. The overflow and the 3px rule were written for the chips.
4. **Nameplate hover.** `.ch-nameplate a:hover` is `{colors.warning}` on `{colors.brand}` (about 3.5:1). Resting text is `{colors.foreground}` on `{colors.brand}` (about 4.9:1). No other palette colour both clears 4.5:1 on `{colors.brand}` and reads as a change from white.
5. **Kicker on a solid slab.** `.ch-kicker` is `{colors.brand-bright}`. That clears 4.5:1 on the canvas and fails it on solid `{colors.card}` (hover card, nav popout). On `bg-card/50` over the canvas it barely passes.
6. **Token names across apps.** `apps/web` calls the blue `--color-accent`. `apps/web-next` calls it `--color-brand` and uses `accent` for the hover well. Same hexes, different roles.
7. **Shadow steps.** `--shadow-2xs` and `--shadow-xs` are both `2px 2px 0 0`. Every larger step grows by a pixel, except those two.
