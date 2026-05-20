/** Minifies a GraphQL query template literal (no variable interpolation). */
export const gql = (
    strings: TemplateStringsArray,
    ...values: ReadonlyArray<unknown>
): string => {
    const query = strings.reduce(
        (result, str, index) =>
            result +
            str +
            (values[index] !== undefined ? String(values[index]) : ""),
        "",
    )

    return query
        .split("\n")
        .filter((line) => line.length > 0)
        .join("\n")
}
