import React, { FC } from 'react';

interface Option<T> {
    value: T;
    label: string;
}

interface Props<T> {
    options: Option<T>[];
    value: string;
    onChange: (value: T) => void;
}

export const Select: FC<Props<string>> = <T extends string>({ options, value, onChange }: Props<T>) => {
    const handleOnChange = (e: React.FormEvent<HTMLSelectElement>) => onChange(e.currentTarget.value as T);

    return (
        <select value={value} onChange={handleOnChange}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};
