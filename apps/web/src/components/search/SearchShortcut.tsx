import { isTextEntryTarget } from "@/lib/dom"
import { useEffect } from "react"

/**
 * Global `/` shortcut.
 *
 * Focuses whichever search bar is on screen: the rankings/hero bar when there
 * is one, otherwise the header pill, which turns into an input.
 */
export const SearchShortcut = () => {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.key !== "/" ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey
            ) {
                return
            }
            if (isTextEntryTarget(document.activeElement)) return

            event.preventDefault()

            const input = document.querySelector<HTMLInputElement>(
                "[data-search-input]",
            )
            if (input) {
                input.focus()
                input.select()
                return
            }

            document
                .querySelector<HTMLButtonElement>("[data-search-trigger]")
                ?.click()
        }

        document.addEventListener("keydown", onKeyDown)

        return () => document.removeEventListener("keydown", onKeyDown)
    }, [])

    return null
}
