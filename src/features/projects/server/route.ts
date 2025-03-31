import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";

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
    .patch("/:projectId", sessionMiddleware, zValidator("form", updateProjectSchema), async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const storage = c.get("storage")
        const { projectId } = c.req.param()

        const { name, image } = c.req.valid("form");

        const isProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )


        if (!isProject) {
            return c.json({ error: "Project not found" }, 404)
        }
        const member = await getMember({
            databases,
            workspaceId: isProject.workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized access" }, 403)
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
        else {
            imageUrl = image;
        }

        const project = await databases.updateDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
            {
                name,
                imageUrl,
            }
        )

        return c.json({ data: project })

    })
    .delete("/:projectId", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { projectId } = c.req.param()

        const isProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )

        if (!isProject) {
            return c.json({ error: "Project not found" }, 404)
        }
        const member = await getMember({
            databases,
            workspaceId: isProject.workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId)

        return c.json({ data: { $id: projectId }, message: "Project deleted successfully" })
    })

export default app;