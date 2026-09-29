import { useRouterState } from "@tanstack/react-router"

/**
 * True on the landing page.
 *
 * The landing keeps the transparent shell (the hero draws over the background
 * pattern); every other page uses the dark shell with a rounded content card.
 */
export const useIsLandingPage = (): boolean =>
    useRouterState({ select: (state) => state.location.pathname === "/" })
