import { Atom } from "effect/unstable/reactivity"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
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
import { SearchIcon } from "lucide-react"
import { lookupAtom } from "@/effect/atoms"
import { recentsAtom, withRecent } from "@/effect/recents"
import { activeQueryAtom, searchQueryAtom } from "@/effect/search"
import { clanHref, playerHref } from "@/lib/rankings"
import { cn } from "@/lib/cn"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { MIN_LOOKUP_LENGTH } from "@crh/api-contract/schemas"
import { getEntitySlug } from "@crh/common/helpers/entitySlug"
import type { LookupResult } from "@crh/api-contract/schemas"
import type { ReactNode } from "react"

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

const idleAtom = Atom.make(AsyncResult.success([] as readonly LookupResult[]))

const LOOKUP_LIMIT = 10

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
                ? playerHref(result.slug)
                : clanHref(result.slug),
        entry: { type: result.type, id: result.id, name: result.name },
    }
}

type Status = "idle" | "recents" | "pending" | "miss" | "results"

export const SearchProvider = ({
    children,
}: {
    readonly children: ReactNode
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])

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

    useEffect(() => {
        if (isOpen) return

        setQuery("")
    }, [isOpen, setQuery])

    const lookup = useMemo(
        () => (active === "" ? idleAtom : lookupAtom(active, LOOKUP_LIMIT)),
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
                              ? playerHref(getEntitySlug(entry.id, entry.name))
                              : clanHref(getEntitySlug(entry.id, entry.name)),
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

    return (
        <CommandDialog
            open={isOpen}
            onOpenChange={(next) => !next && close()}
            title="Search players and clans"
            description="Type a player or clan name to open its profile."

            className="top-16 w-[95vw] max-w-xl translate-y-0"
        >
            <Command shouldFilter={false} loop>
                <CommandInput
                    autoFocus
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search players and clans…"
                    aria-label="Search players and clans"
                />
                <CommandList className="max-h-[60vh]">
                    {status === "recents" && (
                        <CommandGroup heading="Recent">
                            {rows.map((row) => (
                                <Row key={row.key} row={row} onSelect={go} />
                            ))}
                        </CommandGroup>
                    )}

                    {status === "results" && (
                        <CommandGroup heading="Results">
                            {rows.map((row) => (
                                <Row key={row.key} row={row} onSelect={go} />
                            ))}
                        </CommandGroup>
                    )}
                    <CommandEmpty className="px-3 py-4 text-left text-sm text-muted-foreground">
                        {status === "pending" && "Searching…"}

                        {status === "idle" && (
                            <>
                                Type at least {MIN_LOOKUP_LENGTH} characters to
                                search players and clans.
                            </>
                        )}

                        {status === "miss" && (
                            <>
                                No players or clans match “{active}”. Try a
                                shorter spelling, or the start of the name
                                rather than the middle.
                            </>
                        )}
                    </CommandEmpty>
                </CommandList>
            </Command>
        </CommandDialog>
    )
}

const Row = ({
    row,
    onSelect,
}: {
    readonly row: Row
    readonly onSelect: (row: Row) => void
}) => (
    <CommandItem value={row.key} onSelect={() => onSelect(row)}>
        <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">{row.name}</span>
            <span className="truncate text-xs text-muted-foreground">
                {row.meta}
            </span>
        </span>
    </CommandItem>
)

export const SearchTrigger = ({
    className,
}: {
    readonly className?: string
}) => {
    const { open } = useSearch()

    return (
        <Button
            type="button"
            variant="ghost"
            onClick={open}
            data-search-trigger
            className={cn(
                "h-auto w-full justify-between gap-2 bg-card px-2.5 py-1.5 text-sm font-normal tracking-normal normal-case text-muted-foreground hover:bg-bgVar2 hover:text-foreground",
                className,
            )}
        >
            <span className="flex min-w-0 items-center gap-2">
                <SearchIcon data-icon="inline-start" />
                <span className="truncate">Search players and clans</span>
            </span>
            <Kbd>/</Kbd>
        </Button>
    )
}
