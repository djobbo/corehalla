import { theme } from "../theme"
import ReactSelect from "react-select"

export interface Option<T> {
    value: T
    label: string
}

interface Props<T> {
    onChange?: (value: T) => void
    onInputChange?: (value: string) => void
    options: Option<T>[]
    placeholder?: string
    value: T
    className?: string
}

export const Select = <T extends string>({
    onChange,
    options,
    value,
    className,
}: Props<T>): JSX.Element => {
    const handleChange = (value: Option<T> | null) => {
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
                    color: theme.colors.blue12.toString(),
                }),
                control: (styles) => ({
                    ...styles,
                    backgroundColor: theme.colors.blue1.toString(),
                    borderRadius: "0.5rem",
                    border: `2px solid ${theme.colors.blue3}`,
                    cursor: "pointer",
                }),
                menu: (styles) => ({
                    ...styles,
                    backgroundColor: theme.colors.blue2.toString(),
                }),
                option: (styles) => ({
                    ...styles,
                    color: "var(--on-bg-dark)",
                    backgroundColor: "var(--bg-dark)",
                    cursor: "pointer",
                    ":hover": {
                        backgroundColor: theme.colors.blue4.toString(),
                    },
                }),
            }}
        />
    )
}
