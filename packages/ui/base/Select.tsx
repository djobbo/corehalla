import { cn } from "common/helpers/classnames"
import { theme } from "../theme"
import { useId } from "react"
import ReactSelect from "react-select"

type SelectOption<T> = {
    value: T
    label: string
}

type SelectProps<T> = {
    onChange?: (value: T) => void
    onInputChange?: (value: string) => void
    options: SelectOption<T>[]
    placeholder?: string
    value: T
    className?: string
    label?: string
}

// TODO: switch Select to shadcn ui
export const Select = <T extends string>({
    onChange,
    options,
    value,
    className,
    label,
}: SelectProps<T>) => {
    const selectId = useId()
    const handleChange = (value: SelectOption<T> | null) => {
        if (!value) return
        onChange?.(value.value)
    }

    return (
        <div className={cn("relative flex items-center gap-2", className)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="relative sm:absolute inline-block sm:block text-sm font-medium text-textVar1 sm:left-0 sm:-top-[1.75rem]"
                >
                    {label}
                </label>
            )}
            <ReactSelect<{ value: T; label: string }>
                id={selectId}
                value={options.find((option) => option.value === value)}
                onChange={handleChange}
                options={options}
                className="flex-1"
                styles={{
                    singleValue: (styles) => ({
                        ...styles,
                        color: theme.colors.text.toString(),
                    }),
                    control: (styles) => ({
                        ...styles,
                        backgroundColor: theme.colors.bgVar2.toString(),
                        borderRadius: "0.5rem",
                        border: `thin solid ${theme.colors.bg}`,
                        cursor: "pointer",
                        padding: "0.25rem 0.5rem",
                    }),
                    menu: (styles) => ({
                        ...styles,
                        backgroundColor: theme.colors.bg.toString(),
                    }),
                    option: (styles) => ({
                        ...styles,
                        color: theme.colors.text.toString(),
                        backgroundColor: theme.colors.bg.toString(),
                        cursor: "pointer",
                        ":hover": {
                            backgroundColor: theme.colors.bgVar1.toString(),
                        },
                    }),
                }}
            />
        </div>
    )
}
