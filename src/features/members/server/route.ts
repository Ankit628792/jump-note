import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from 'zod'
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";

const memberMiddleware = zValidator("query", z.object({ workspaceId: z.string() }))

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


export default app