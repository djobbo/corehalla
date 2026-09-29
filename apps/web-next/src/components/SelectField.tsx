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
