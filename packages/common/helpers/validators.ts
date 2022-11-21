import { z } from "zod"

export const numericLiteralValidator = z.preprocess(
    (p) => parseInt(p as string, 10),
    z.number().positive(),
)
