import { z } from 'zod'

export const createWorkSpaceSchema = z.object({
    name: z.string().min(3, "Minimum 3 characters required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value.trim() === "" ? undefined : value)
    ])
        .optional()
})

