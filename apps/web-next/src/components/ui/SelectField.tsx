import { cn } from "@/lib/cn"

/**
 * A labelled `<select>` in the app's flat styling.
 *
 * A native control on purpose: the option lists are short, and the platform
 * brings keyboard, touch and screen-reader behaviour that a custom listbox
 * would have to re-earn. Only the appearance is overridden — `appearance: none`
 * removes the platform arrow, so the chevron is drawn as a sibling.
 */
export const SelectField = <K extends string>({
    label,
    value,
    options,
    onChange,
    className,
}: {
    readonly label?: string
    readonly value: K
    readonly options: readonly { readonly value: K; readonly label: string }[]
    readonly onChange: (value: K) => void
    readonly className?: string
}) => {
    return (
        <div className={cn("flex min-w-0 flex-col gap-1", className)}>
            {label !== undefined && (
                <span className="ch-stat-label">{label}</span>
            )}
            <div className="relative min-w-0">
                <select
                    className="ch-select"
                    value={value}
                    aria-label={label}
                    onChange={(event) => onChange(event.target.value as K)}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span
                    aria-hidden
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.6rem] text-textVar1"
                >
                    ▼
                </span>
            </div>
        </div>
    )
}
