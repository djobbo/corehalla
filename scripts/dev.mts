import { Effect, Path, Schema } from "effect"
import { ChildProcess } from "effect/process"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"

class DevError extends Schema.TaggedError<DevError>()("DevError", {
    message: Schema.String,
}) {}

const run = (name: string, args: ReadonlyArray<string>, cwd: string) =>
    Effect.scoped(
        Effect.gen(function* () {
            const handle = yield* ChildProcess.make("vp", args, {
                cwd,
                stdin: "inherit",
                stdout: "inherit",
                stderr: "inherit",
            })
            const exitCode = yield* handle.exitCode

            if (exitCode !== 0) {
                return yield* new DevError({
                    message: `${name} exited with code ${exitCode}`,
                })
            }
        }),
    )

const main = Effect.gen(function* () {
    const path = yield* Path.Path
    const root = path.resolve(".")

    yield* Effect.all(
        [
            run(
                "stack",
                ["exec", "alchemy", "dev", "--env-file", ".env"],
                root,
            ),
            run("cms", ["run", "--filter", "@crh/cms", "dev"], root),
        ],
        { concurrency: 2 },
    )
}).pipe(
    Effect.ensuring(
        Effect.gen(function* () {
            const path = yield* Path.Path
            const cms = path.join(path.resolve("."), "apps/cms")

            yield* run("cms:stop", ["exec", "astro", "dev", "stop"], cms)
        }).pipe(Effect.ignore),
    ),
)

NodeRuntime.runMain(Effect.provide(main, NodeServices.layer))
