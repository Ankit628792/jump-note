import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from 'zod'
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { MEMBER_ROLE } from "../types";

const memberMiddleware = zValidator("query", z.object({ workspaceId: z.string() }))
const updateMemberMiddleware = zValidator("json", z.object({ role: z.nativeEnum(MEMBER_ROLE) }))

const app = new Hono()
    .get("/", sessionMiddleware, memberMiddleware, async (c) => {
        const { users } = await createAdminClient()
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.valid("query")

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        })
        if (!member) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [
                Query.equal("workspaceId", workspaceId),
            ]
        )

        const populatesMembers = await Promise.all(
            members.documents.map(async (member) => {
                const userDoc = await users.get(member.userId);
                return { ...member, name: userDoc.name, email: userDoc.email };
            })
        )

        return c.json({
            data: {
                ...members,
                documents: populatesMembers
            }
        })
    })
    .delete("/:memberId", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { memberId } = c.req.param()

        const memberToDelete = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId
        )

        if (!memberToDelete) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        const allMembersInWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [
                Query.equal("workspaceId", memberToDelete.workspaceId),
            ]
        )

        const member = await getMember({
            databases,
            workspaceId: memberToDelete.workspaceId,
            userId: user.$id,
        })

        if (!member || (member.$id !== memberToDelete.$id && member.role !== MEMBER_ROLE.ADMIN)) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        if (allMembersInWorkspace.total === 1) {
            return c.json({ error: "Cannot delete the only member" }, 401)
        }

        await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId)

        return c.json({ data: { $id: memberToDelete.$id } })
    })
    .patch("/:memberId", sessionMiddleware, updateMemberMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { memberId } = c.req.param()
        const { role } = c.req.valid("json")

        const memberToUpdate = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId
        )

        if (!memberToUpdate) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        const allMembersInWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [
                Query.equal("workspaceId", memberToUpdate.workspaceId),
            ]
        )

        const member = await getMember({
            databases,
            workspaceId: memberToUpdate.workspaceId,
            userId: user.$id,
        })

        if (!member || (member.$id !== memberToUpdate.$id && member.role !== MEMBER_ROLE.ADMIN)) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        if (allMembersInWorkspace.total === 1) {
            return c.json({ error: "Cannot downgrade the only member" }, 401)
        }

        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
            role
        })

        return c.json({ data: { $id: memberToUpdate.$id } })
    })

export default app