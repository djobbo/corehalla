export const arrayToMap = <T, Key extends keyof T>(
    arr: (T & { [k in Key]: string | number | symbol })[],
    key: Key,
    // @ts-expect-error ts doesn't know that T[Key] is a string | number | symbol
): Record<T[Key], T> =>
    // @ts-expect-error ts doesn't know that T[Key] is a string | number | symbol
    arr.reduce<Record<T[Key], T>>(
        (obj, item) => ((obj[item[key]] = item), obj),
        // @ts-expect-error ts doesn't know that T[Key] is a string | number | symbol
        {},
    )
