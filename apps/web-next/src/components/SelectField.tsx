import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/cn"
import { useId } from "react"

/**
 * A labelled select, on shadcn's `Select`.
 *
 * It used to be a native `<select>` with only its appearance overridden, on the
 * argument that the platform's keyboard, touch and screen-reader behaviour is
 * hard to re-earn. That argument still holds — it is just no longer a reason to
 * write the control by hand: shadcn's `Select` is Base UI's listbox, which is
 * where that behaviour now comes from, and it brings typeahead, `aria-activedescendant`
 * tracking and correct focus return with it. The native element would also have
 * kept the option list unstyleable, which the popover does not.
 *
 * The trigger is drawn as the recessed well the rest of the design uses (see
 * `select.tsx`), and `Field` supplies the label rather than a bare `<span>`, so
 * the control and its name are associated in the accessibility tree.
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
    const labelId = useId()

    /*
     * Base UI reads the option list from `items` to resolve the trigger's label,
     * so the array has to exist independently of the JSX below.
     */
    const items = options.map((option) => ({
        label: option.label,
        value: option.value,
    }))

    return (
        <div className={cn("flex min-w-0 flex-col gap-1", className)}>
            {label !== undefined && (
                <span id={labelId} className="ch-stat-label">
                    {label}
                </span>
            )}

            <Select
                items={items}
                value={value}
                onValueChange={(next) => onChange(next as K)}
            >
                <SelectTrigger
                    className="w-full"
                    aria-labelledby={label === undefined ? undefined : labelId}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
