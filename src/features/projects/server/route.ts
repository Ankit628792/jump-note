import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema } from "../schema";

const app = new Hono()
    .get("/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { workspaceId } = c.req.valid("query");

            if (!workspaceId) {
                return c.json({ error: "Missing workspaceId" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401);
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ]
            )

            return c.json({ data: projects });
        }
    )
    .post("/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")

            const { name, image, workspaceId } = c.req.valid("form");

            if (!workspaceId) {
                return c.json({ error: "Missing workspaceId" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

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
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl,
                    workspaceId
                }
            )

            return c.json({ data: workspace })
        }
    )

export default app;