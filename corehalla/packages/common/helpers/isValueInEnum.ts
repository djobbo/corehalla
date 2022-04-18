export const isValueInEnum =
    <EnumType>(enumType: EnumType) =>
    (value: unknown): value is EnumType =>
        Object.values(enumType).includes(value)
