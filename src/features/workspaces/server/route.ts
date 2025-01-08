import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkSpaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";
import { MEMBER_ROLE } from "@/features/members/types";

const createWorkSpaceMiddleware = zValidator("form", createWorkSpaceSchema)

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const workSpaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
        )
        return c.json({ data: workSpaces })
    })
    .post("/", createWorkSpaceMiddleware, sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")

        const { name, image } = c.req.valid("form");

        let imageUrl: string | undefined;

        if (image instanceof File) {
            const storage = c.get("storage")
            const uploadedFile = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image
            )
            const arrayBuffer = await storage.getFilePreview(
                IMAGES_BUCKET_ID,
                uploadedFile.$id
            );

            imageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
        }

        const workspace = await databases.createDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                name,
                userId: user.$id,
                imageUrl
            }
        )

        await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                userId: user.$id,
                workspaceId: workspace.$id,
                role: MEMBER_ROLE.ADMIN
            }
        )

        return c.json({ data: workspace })
    })

export default app