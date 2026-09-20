import "@tanstack/react-start/server-only"
import { appRouter } from "server/router"

/**
 * Server-only tRPC caller.
 *
 * All typed server functions delegate to the existing, already-validated tRPC
 * procedures in `packages/server`. Keeping the caller here (in a `.server.ts`
 * module protected by TanStack Start's import protection) guarantees that the
 * database client, service keys, and Brawlhalla API key never reach the
 * browser bundle.
 *
 * `packages/server` is not modified: the worker and any external `/api/trpc`
 * consumers keep using the exact same router.
 */
export const getCaller = () => appRouter.createCaller({})
