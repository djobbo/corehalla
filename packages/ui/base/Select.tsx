import { theme } from "../theme"
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
}

export const Select = <T extends string>({
    onChange,
    options,
    value,
    className,
}: SelectProps<T>) => {
    const handleChange = (value: SelectOption<T> | null) => {
        if (!value) return
        onChange?.(value.value)
    }

    return (
        <ReactSelect<{ value: T; label: string }>
            value={options.find((option) => option.value === value)}
            onChange={handleChange}
            options={options}
            className={className}
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
    )
}
