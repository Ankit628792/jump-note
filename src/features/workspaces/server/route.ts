import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkSpaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";

const createWorkSpaceMiddleware = zValidator("json", createWorkSpaceSchema)

const app = new Hono()
    .post("/", createWorkSpaceMiddleware, sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")

        const { name } = c.req.valid("json");

        const workspace = await databases.createDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                name,
                userId: user.$id
            }
        )

        return c.json({ data: workspace })
    })

export default app