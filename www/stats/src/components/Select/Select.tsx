import { useEffect, useState } from 'react'
import ReactSelect, { ActionMeta, InputActionMeta } from 'react-select'

export interface Option<T> {
    value: T
    label?: string
}

interface Props<T> {
    onChange?: (value: T) => void
    onInputChange?: (value: string) => void
    options: Option<T>[]
    placeholder?: string
    defaultValue?: Option<T>
    searchable?: boolean
    clearable?: boolean
}

export const Select = <T extends string>({
    onChange,
    options,
    placeholder,
    defaultValue,
    onInputChange,
    searchable,
    clearable,
}: Props<T>): JSX.Element => {
    const [inputValue, setInputValue] = useState('')
    const [fieldValue, setFieldValue] = useState<Required<Option<T>>>(
        defaultValue ? { label: defaultValue.label ?? defaultValue.value, value: defaultValue.value } : null,
    )

    const handleInputChange = (value: string, action: InputActionMeta) => {
        if (action.action !== 'input-blur' && action.action !== 'menu-close') {
            setInputValue(value)
            if (value.trim() === '') {
                setFieldValue(null)
            } else {
                setFieldValue({ value: value as T, label: value })
            }
        }
    }

    const handleFieldChange = (item: Required<Option<T>>, action: ActionMeta<Option<T>>) => {
        if (action.action === 'clear') {
            setInputValue('')
        }
        setFieldValue(item)
    }

    useEffect(() => {
        onInputChange?.(inputValue)
    }, [inputValue])

    useEffect(() => {
        onChange?.(fieldValue?.value)
    }, [fieldValue])

    return (
        <ReactSelect<{ value: T; label: string }>
            isClearable={clearable ?? false}
            isSearchable={searchable ?? false}
            inputValue={inputValue}
            value={fieldValue}
            onInputChange={handleInputChange}
            onChange={handleFieldChange}
            blurInputOnSelect
            options={options.map(({ label, value }) => ({ label: label ?? value, value }))}
            placeholder={placeholder}
            styles={{
                container: (styles) => ({
                    ...styles,
                    minWidth: '240px',
                    flex: '1',
                }),
                valueContainer: (styles) => ({
                    ...styles,
                    cursor: searchable ? 'text' : 'default',
                }),
                indicatorsContainer: (styles) => ({
                    ...styles,
                    cursor: 'pointer',
                }),
                singleValue: (styles) => ({
                    ...styles,
                    color: 'var(--on-bg-dark)',
                }),
                placeholder: (styles) => ({
                    ...styles,
                    color: 'var(--on-bg-dark-var1)',
                }),
                input: (styles) => ({
                    ...styles,
                    color: 'var(--on-bg-dark)',
                }),
                control: (styles) => ({
                    ...styles,
                    backgroundColor: 'var(--bg-dark-var1)',
                    border: 'none',
                }),
            }}
            defaultValue={
                defaultValue
                    ? {
                          label: defaultValue.label ?? defaultValue.value,
                          value: defaultValue.value,
                      }
                    : undefined
            }
        />
    )
}
