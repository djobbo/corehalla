import { HiOutlineSearch } from "@react-icons/all-files/hi/HiOutlineSearch"
import { cn } from "common/helpers/classnames"
import { useEffect, useRef } from "react"
import { consumeSearchFocus } from "@/lib/search"
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"

type SearchBarProps = {
    value: string
    onChange: (value: string) => void
    onSubmit?: () => void
    /**
     * Fired when the user clicks the bar. The entry bars use it to jump
     * straight into the full-page search; the results bar does not pass it.
     */
    onActivate?: () => void
    /** Overrides the default Esc behaviour (clear the query). */
    onEscape?: () => void
    placeholder?: string
    autoFocus?: boolean
    className?: string
    size?: "md" | "lg"
    /** Rendered in a row inside the box, under the input. */
    filters?: ReactNode
    /**
     * Keeps the box on screen but inert, for tables whose endpoint has no name
     * filter yet — the filters stay usable.
     */
    disabled?: boolean
    disabledHint?: string
}

/**
 * The one search input.
 *
 * Used by the rankings tables and by the landing hero, so "search" looks and
 * behaves the same wherever it starts.
 */
export const SearchBar = ({
    value,
    onChange,
    onSubmit,
    onActivate,
    onEscape,
    placeholder = "Search player or clan...",
    autoFocus,
    className,
    size = "lg",
    filters,
    disabled,
    disabledHint,
}: SearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (autoFocus || consumeSearchFocus()) {
            inputRef.current?.focus()
        }
    }, [autoFocus])

    const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            if (onEscape) {
                event.preventDefault()
                onEscape()
                return
            }
            if (value) {
                event.preventDefault()
                onChange("")
            } else {
                event.currentTarget.blur()
            }
            return
        }
        if (event.key === "Enter") {
            event.preventDefault()
            onSubmit?.()
        }
    }

    return (
        <div
            // Exactly one of these exists per page (the header pill hides on
            // pages that render the bar), so the name is never duplicated and
            // the hand-off reads as the same element travelling.
            // The disabled box is not a search entry point, and on those
            // pages the header pill is on screen — it owns the name.
            style={{
                viewTransitionName: disabled ? undefined : "search-bar",
            }}
            className={cn(
                "w-full rounded-xl border border-bg bg-bgVar2 px-4 transition-colors",
                "focus-within:border-accent/70 focus-within:shadow-[0_0_0_4px_rgba(56,97,251,0.12)] hover:border-textVar1/40",
                className,
            )}
        >
            <div
                className={cn(
                    "flex w-full items-center gap-3",
                    size === "lg" ? "h-12" : "h-9",
                )}
            >
                <HiOutlineSearch className="h-4 w-4 shrink-0 text-textVar1" />
                <input
                    ref={inputRef}
                    data-search-input
                    type="text"
                    value={value}
                    disabled={disabled}
                    title={disabled ? disabledHint : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={placeholder}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    onClick={onActivate}
                    onKeyDown={onKeyDown}
                    className={cn(
                        "h-full w-full bg-transparent text-text outline-none placeholder:text-textVar1/60",
                        size === "lg" ? "text-base sm:text-lg" : "text-sm",
                        disabled &&
                            "cursor-not-allowed text-textVar1 placeholder:text-textVar1/40",
                    )}
                />
            </div>
            {filters && (
                <div className="flex items-center justify-end gap-2 px-2 pb-2">
                    {filters}
                </div>
            )}
        </div>
    )
}
