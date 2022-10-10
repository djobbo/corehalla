export const isValueInEnum =
    <EnumType extends object>(enumType: EnumType) =>
    (value: unknown): value is EnumType =>
        Object.values(enumType).includes(value)
