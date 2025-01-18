import { z } from 'zod'

export const createWorkSpaceSchema = z.object({
    name: z.string().min(3, "Minimum 3 characters required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value.trim() === "" ? undefined : value)
    ])
        .optional()
})


export const updateWorkSpaceSchema = z.object({
    name: z.string().min(3, "Must be more than 3 characters").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value.trim() === "" ? undefined : value)
    ])
        .optional()
})

export const joinWorkSpaceSchema = z.object({ code: z.string() })
