import ReactSelect from 'react-select';

// interface Props<T extends string> {
//     options: { option: T; displayName?: string }[];
//     action: (selected: T) => void;
// }

// export function Select<T extends string>({ options, action }: Props<T>): JSX.Element {
//     return (
//         <select
//             className={styles.options}
//             onChange={(e) => {
//                 action(e.target.value as T);
//             }}
//         >
//             {options.map(({ option, displayName }) => (
//                 <option key={option} value={option}>
//                     {displayName ?? option}
//                 </option>
//             ))}
//         </select>
//     );
// }

interface Option<T> {
    value: T;
    label?: string;
}

interface Props<T> {
    onChange?: (value: T) => void;
    options: Option<T>[];
    placeholder?: string;
    defaultValue?: Option<T>;
}

export const Select = <T extends string>({ onChange, options, placeholder, defaultValue }: Props<T>): JSX.Element => {
    return (
        <ReactSelect<{ value: T; label: string }>
            onChange={({ value }) => onChange?.(value)}
            options={options.map(({ label, value }) => ({ label: label ?? value, value }))}
            placeholder={placeholder}
            styles={{
                container: (styles) => ({
                    ...styles,
                    minWidth: '240px',
                }),
                singleValue: (styles) => ({
                    ...styles,
                    color: 'var(--on-bg-dark)',
                }),
                placeholder: (styles) => ({
                    ...styles,
                    color: 'var(--on-bg-dark-var1)',
                }),
                control: (styles) => ({
                    ...styles,
                    backgroundColor: 'var(--bg-dark)',
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
    );
};
