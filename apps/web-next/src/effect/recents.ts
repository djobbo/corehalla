import { Effect, Layer, Schema } from "effect"
import { Atom } from "effect/unstable/reactivity"
import { KeyValueStore } from "effect/unstable/persistence"

/**
 * Recently opened entities, persisted and reactive.
 *
 * ## Why this is not a `localStorage` call
 *
 * The store is Effect's `KeyValueStore`, so *where* recents live is a layer
 * decision rather than something the UI knows. `layerStorage` binds it to the Web
 * Storage API on the client, and the server render gets an in-memory store —
 * chosen with `Layer.unwrap`, because the choice has to be made when the layer is
 * built and `localStorage` does not exist in a Worker.
 *
 * That also means the persisted shape is a schema. A value written by an older
 * build decodes or it does not; it cannot half-apply and leave the overlay
 * rendering rows with missing fields.
 *
 * `Atom.kvs` is what makes it reactive, so a write is visible to every reader
 * without anyone re-reading storage by hand.
 */

const RecentEntry = Schema.Struct({
    type: Schema.Literals(["player", "clan"]),
    id: Schema.String,
    name: Schema.String,
})

/**
 * Web Storage on the client, memory on the server.
 *
 * The server never renders a recents list, but the layer is still built if
 * anything touches the atom during a render, and reaching for `localStorage`
 * there would throw.
 */
const storageLayer = Layer.unwrap(
    Effect.sync(() =>
        typeof window === "undefined" || !window.localStorage
            ? KeyValueStore.layerMemory
            : KeyValueStore.layerStorage(() => window.localStorage),
    ),
)

const runtime = Atom.runtime(storageLayer)

/** How many are kept. Enough to cover a session's worth of lookups. */
export const MAX_RECENTS = 8

export type Recent = typeof RecentEntry.Type

/** The persisted list. Read it with an atom; write it with `withRecent`. */
export const recentsAtom = Atom.kvs({
    runtime,
    key: "corehalla:recents",
    schema: Schema.Array(RecentEntry),
    defaultValue: (): readonly Recent[] => [],
})

/**
 * The next list after opening `entry`.
 *
 * Pure, so the ordering rule is testable without storage or a browser: the newly
 * opened entry moves to the front, an existing entry is moved rather than
 * duplicated, and the oldest falls off the end.
 */
export const withRecent = (
    current: readonly Recent[],
    entry: Recent,
): readonly Recent[] =>
    [
        entry,
        ...current.filter(
            (recent) =>
                !(recent.type === entry.type && recent.id === entry.id),
        ),
    ].slice(0, MAX_RECENTS)
