import { useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/cn"

export type VersusMode = "players" | "legends"

const modes = [
    { value: "players", label: "Players" },
    { value: "legends", label: "Legends" },
] as const satisfies readonly {
    readonly value: VersusMode
    readonly label: string
}[]

/**
 * Switching kind replaces the whole comparison: a player slug and a legend slug
 * are different namespaces, so neither side carries over.
 */
export const VersusModeSwitch = ({ mode }: { readonly mode: VersusMode }) => {
    const navigate = useNavigate()

    return (
        <fieldset className="flex min-w-0 flex-col gap-1">
            <legend className="ch-kicker">Comparison</legend>
            <div className="flex flex-wrap gap-1.5">
                {modes.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={option.value === mode}
                        onClick={() => {
                            if (option.value === mode) return

                            void navigate({
                                to: "/vs",
                                search:
                                    option.value === "legends"
                                        ? { type: "legends" }
                                        : {},
                            })
                        }}
                        className={cn(
                            "ch-chip",
                            option.value === mode
                                ? "ch-chip-on"
                                : "ch-chip-off",
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </fieldset>
    )
}
