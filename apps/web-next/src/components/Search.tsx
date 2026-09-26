import { Atom } from "effect/unstable/reactivity"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as Dialog from "@radix-ui/react-dialog"
import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { useNavigate } from "@tanstack/react-router"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { lookupAtom } from "@/effect/atoms"
import { recentsAtom, withRecent } from "@/effect/recents"
import { activeQueryAtom, searchQueryAtom } from "@/effect/search"
import { clanHref, playerHref } from "@/lib/rankings"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import type { LookupResult } from "@crh/api-contract/schemas"
import type { ReactNode } from "react"

/**
 * Search, available from every page.
 *
 * One overlay mounted once rather than a page, because searching is a detour:
 * you arrive, find the thing, and land on its profile with the page you came from
 * still behind you. A search *route* would replace that page and make the back
 * button the way out.
 *
 * Its state is Effect-native: the query and its debounce are atoms
 * (`effect/search`), and recents are a `KeyValueStore`-backed atom
 * (`effect/recents`). What remains here is presentation and keyboard handling.
 */

type SearchContextValue = {
    readonly isOpen: boolean
    readonly open: () => void
    readonly close: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export const useSearch = (): SearchContextValue => {
    const value = useContext(SearchContext)

    if (!value) {
        throw new Error("useSearch must be used inside <SearchProvider>")
    }

    return value
}

/** Read while the query is too short to send, so nothing is fetched. */
const idleAtom = Atom.make(AsyncResult.success([] as readonly LookupResult[]))

/** How many results the overlay asks for. */
const LOOKUP_LIMIT = 10

/** What the list needs, so both sources can feed it. */
type Row = {
    readonly key: string
    readonly name: string
    readonly meta: string
    readonly href: string
    readonly entry: {
        readonly type: "player" | "clan"
        readonly id: string
        readonly name: string
    }
}

const rowFromResult = (result: LookupResult): Row => {
    const parts: string[] = [result.type === "player" ? "Player" : "Clan"]

    if (result.type === "player") {
        if (result.tier) parts.push(result.tier)
        if (result.rating !== null) parts.push(`${result.rating} rating`)
        if (result.region) parts.push(result.region.toUpperCase())
        if (result.source === "archive") parts.push("known locally")
    } else if (result.xp !== null) {
        parts.push(`${result.xp} XP`)
    }

    if (result.aliases.length > 0) {
        parts.push(`also ${result.aliases.join(", ")}`)
    }

    return {
        key: `${result.type}:${result.id}`,
        name: result.name,
        meta: parts.join(" · "),
        href:
            result.type === "player"
                ? playerHref(result.id)
                : clanHref(result.id),
        entry: { type: result.type, id: result.id, name: result.name },
    }
}

/**
 * What the list is currently showing.
 *
 * Derived in one place so the render cannot disagree with itself about, say,
 * whether to show the "keep typing" hint or an empty result set.
 */
type Status = "idle" | "recents" | "pending" | "miss" | "results"

export const SearchProvider = ({ children }: { readonly children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])

    /**
     * A global shortcut, because the field is not always where the eyes are.
     *
     * `/` is the convention for search on a content site, and it is ignored while
     * the caret is already in a field so it can still be typed into one.
     * ⌘K/Ctrl+K is here because it is what a keyboard user tries first.
     */
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null
            const typing =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target?.isContentEditable === true

            if (
                event.key.toLowerCase() === "k" &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault()
                setIsOpen((current) => !current)
                return
            }

            if (event.key === "/" && !typing) {
                event.preventDefault()
                setIsOpen(true)
            }
        }

        document.addEventListener("keydown", onKeyDown)

        return () => document.removeEventListener("keydown", onKeyDown)
    }, [])

    return (
        <SearchContext.Provider value={{ isOpen, open, close }}>
            {children}
            <SearchOverlay />
        </SearchContext.Provider>
    )
}

const SearchOverlay = () => {
    const { isOpen, close } = useSearch()
    const navigate = useNavigate()

    const query = useAtomValue(searchQueryAtom)
    const setQuery = useAtomSet(searchQueryAtom)
    const active = useAtomValue(activeQueryAtom)

    const recents = useAtomValue(recentsAtom)
    const setRecents = useAtomSet(recentsAtom)

    const [highlighted, setHighlighted] = useState(0)

    // Cleared on close rather than on open: the settled query lags the raw one by
    // the debounce, so clearing at open time would briefly show the previous
    // query's results. Clearing on the way out means the next open starts clean.
    useEffect(() => {
        if (isOpen) return

        setQuery("")
        setHighlighted(0)
    }, [isOpen, setQuery])

    const lookup = useMemo(
        () =>
            active === ""
                ? idleAtom
                : lookupAtom(active, LOOKUP_LIMIT),
        [active],
    )

    const result = useAtomValue(lookup)

    const resultRows = useMemo(
        () =>
            result._tag === "Success" ? result.value.map(rowFromResult) : [],
        [result],
    )

    const status: Status =
        active === ""
            ? recents.length > 0
                ? "recents"
                : "idle"
            : result._tag === "Initial"
              ? "pending"
              : resultRows.length === 0
                ? "miss"
                : "results"

    const rows = useMemo<readonly Row[]>(
        () =>
            active === ""
                ? recents.map((entry) => ({
                      key: `${entry.type}:${entry.id}`,
                      name: entry.name,
                      meta: entry.type === "player" ? "Player" : "Clan",
                      href:
                          entry.type === "player"
                              ? playerHref(entry.id)
                              : clanHref(entry.id),
                      entry,
                  }))
                : resultRows,
        [active, recents, resultRows],
    )

    const go = useCallback(
        (row: Row) => {
            setRecents(withRecent(recents, row.entry))
            close()
            void navigate({ to: row.href })
        },
        [close, navigate, recents, setRecents],
    )

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault()
            setHighlighted((current) =>
                rows.length === 0 ? 0 : (current + 1) % rows.length,
            )
            return
        }

        if (event.key === "ArrowUp") {
            event.preventDefault()
            setHighlighted((current) =>
                rows.length === 0
                    ? 0
                    : (current - 1 + rows.length) % rows.length,
            )
            return
        }

        if (event.key === "Enter") {
            event.preventDefault()

            // Enter opens the highlighted row, which defaults to the first — the
            // whole point of ranking the list.
            const row = rows[highlighted] ?? rows[0]

            if (row) go(row)
        }
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(next) => !next && close()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed left-1/2 top-16 z-50 w-[95vw] max-w-xl -translate-x-1/2 rounded-lg border border-bg bg-bgVar2 p-3"
                >
                    <Dialog.Title className="sr-only">
                        Search players and clans
                    </Dialog.Title>

                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setHighlighted(0)
                        }}
                        onKeyDown={onKeyDown}
                        placeholder="Search players and clans…"
                        aria-label="Search players and clans"
                        className="w-full rounded border border-bg bg-bgVar1 px-2 py-2 text-sm outline-none"
                    />

                    <div className="mt-2 max-h-[60vh] overflow-y-auto">
                        {status === "pending" && (
                            <p className="px-2 py-3 text-sm text-textVar1">
                                Searching…
                            </p>
                        )}

                        {status === "idle" && (
                            <p className="px-2 py-3 text-sm text-textVar1">
                                Type at least {MIN_LOOKUP_LENGTH} characters to
                                search players and clans.
                            </p>
                        )}

                        {status === "miss" && (
                            // An honest miss. Prefix-only search means a typo
                            // finds nothing, so this says what was searched and
                            // what to try instead of just "no results".
                            <p className="px-2 py-3 text-sm text-textVar1">
                                No players or clans match “{active}”. Try a
                                shorter spelling, or the start of the name rather
                                than the middle.
                            </p>
                        )}

                        {status === "recents" && (
                            <p className="px-2 py-1 text-xs uppercase text-textVar1">
                                Recent
                            </p>
                        )}

                        {status !== "pending" &&
                            rows.map((row, index) => (
                                <button
                                    key={row.key}
                                    type="button"
                                    onMouseEnter={() => setHighlighted(index)}
                                    onClick={() => go(row)}
                                    className={
                                        "flex w-full flex-col items-start gap-0.5 rounded px-2 py-2 text-left " +
                                        (index === highlighted ? "bg-bg" : "")
                                    }
                                >
                                    <span className="text-sm">{row.name}</span>
                                    <span className="text-xs text-textVar1">
                                        {row.meta}
                                    </span>
                                </button>
                            ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

/**
 * The visible way in.
 *
 * A button that looks like a field rather than a real input: the overlay owns the
 * input, so typing here would mean two sources of truth for the query.
 */
export const SearchTrigger = ({ className }: { readonly className?: string }) => {
    const { open } = useSearch()

    return (
        <button
            type="button"
            onClick={open}
            data-search-trigger
            className={
                "rounded border border-bg bg-bg px-2 py-1 text-left text-sm text-textVar1 hover:text-text " +
                (className ?? "")
            }
        >
            Search players and clans <span className="opacity-60">/</span>
        </button>
    )
}
