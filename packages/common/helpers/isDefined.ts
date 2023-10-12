export const isDefined = <T extends object>(obj: T | null): obj is T => !!obj
