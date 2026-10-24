import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import { Effect } from "effect"
import * as Path from "effect/Path"
import { FetchHttpClient } from "effect/http"
import { downloadImages } from "./roster"

NodeRuntime.runMain(
    downloadImages().pipe(
        Effect.provide(FetchHttpClient.layer),
        Effect.provide(NodeFileSystem.layer),
        Effect.provide(Path.layer),
    ),
)
