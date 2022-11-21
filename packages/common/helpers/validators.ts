import { z } from "zod"

export const numericLiteralValidator = z
    .string()
    .transform((page) => parseInt(page))
