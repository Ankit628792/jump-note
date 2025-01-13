import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import { createWorkSpaceSchema, updateWorkSpaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { MEMBER_ROLE } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "@/features/members/utils";

const createWorkSpaceMiddleware = zValidator("form", createWorkSpaceSchema)
const updateWorkSpaceMiddleware = zValidator("form", updateWorkSpaceSchema)

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user")
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (!members.total) {
            return c.json({ data: { documents: [], total: 0 } })
        }
        const workspaceIds = members.documents.map(doc => doc.workspaceId)
        const workSpaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)]
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
                imageUrl,
                inviteCode: generateInviteCode(6)
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
    .patch("/:workspaceId", sessionMiddleware, updateWorkSpaceMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const storage = c.get("storage")
        const { workspaceId } = c.req.param()

        const { name, image } = c.req.valid("form");

        const isWorkspace = await databases.getDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )


        if (!isWorkspace) {
            return c.json({ error: "Workspace not found" }, 404)
        }
        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (!member || (member.role !== MEMBER_ROLE.ADMIN)) {
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

        const workspace = await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                name,
                imageUrl,
            }
        )

        return c.json({ data: workspace })

    })
    .delete("/:workspaceId", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { workspaceId } = c.req.param()

        const isWorkspace = await databases.getDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        if (!isWorkspace) {
            return c.json({ error: "Workspace not found" }, 404)
        }
        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (!member || (member.role !== MEMBER_ROLE.ADMIN)) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId)

        return c.json({ data: { $id: workspaceId }, message: "Workspace deleted successfully" })
    })
    .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { workspaceId } = c.req.param()

        const isWorkspace = await databases.getDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        if (!isWorkspace) {
            return c.json({ error: "Workspace not found" }, 404)
        }
        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (!member || (member.role !== MEMBER_ROLE.ADMIN)) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        const workspace = await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, { inviteCode: generateInviteCode(6) })

        return c.json({ data: workspace, message: "Invite card reset successfully" })
    })

export default app