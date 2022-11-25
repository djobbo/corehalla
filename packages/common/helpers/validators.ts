import { z } from "zod"

export const numericLiteralValidator = z
    .string()
    .regex(/^[0-9]+$/)
    .transform((page) => parseInt(page))
