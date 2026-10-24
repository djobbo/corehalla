import { Effect, Layer, Schema } from "effect"
import { Atom } from "effect/reactivity"
import { KeyValueStore } from "effect/persistence"

const RecentEntry = Schema.Struct({
    type: Schema.Literals(["player", "clan"]),
    id: Schema.String,
    name: Schema.String,
})

// Memory on the server: `localStorage` does not exist in a Worker.
const storageLayer = Layer.unwrap(
    Effect.sync(() =>
        typeof window === "undefined" || !window.localStorage
            ? KeyValueStore.layerMemory
            : KeyValueStore.layerStorage(() => window.localStorage),
    ),
)

const runtime = Atom.runtime(storageLayer)

export const MAX_RECENTS = 8

export type Recent = typeof RecentEntry.Type

export const recentsAtom = Atom.kvs({
    runtime,
    key: "corehalla:recents",
    schema: Schema.Array(RecentEntry),
    defaultValue: (): readonly Recent[] => [],
})

export const withRecent = (
    current: readonly Recent[],
    entry: Recent,
): readonly Recent[] =>
    [
        entry,
        ...current.filter(
            (recent) => !(recent.type === entry.type && recent.id === entry.id),
        ),
    ].slice(0, MAX_RECENTS)
