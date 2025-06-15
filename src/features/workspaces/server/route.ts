import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import { createWorkSpaceSchema, joinWorkSpaceSchema, updateWorkSpaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { MEMBER_ROLE } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { Workspace } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const createWorkSpaceMiddleware = zValidator("form", createWorkSpaceSchema)
const updateWorkSpaceMiddleware = zValidator("form", updateWorkSpaceSchema)
const joinWorkspaceMiddleware = zValidator("json", joinWorkSpaceSchema)

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
    .post("/:workspaceId/join", sessionMiddleware, joinWorkspaceMiddleware, async (c) => {
        const { workspaceId } = c.req.param()
        const { code } = c.req.valid("json");
        const databases = c.get("databases")
        const user = c.get("user")

        const isWorkspace = await databases.getDocument<Workspace>(DATABASE_ID, WORKSPACES_ID, workspaceId)

        if (!isWorkspace) {
            return c.json({ error: "Workspace not found" }, 404)
        }

        if (code !== isWorkspace.inviteCode) {
            return c.json({ error: "Invalid invite code" }, 400)
        }

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (member) {
            return c.json({ error: "Already a member of this workspace" }, 400)
        }

        await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
            userId: user.$id,
            workspaceId,
            role: MEMBER_ROLE.MEMBER
        })

        return c.json({ data: isWorkspace, message: "Workspace joined successfully" })
    })
    .get("/:workspaceId", sessionMiddleware, async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { workspaceId } = c.req.param()

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        if (!workspace) {
            return c.json({ error: "Workspace not found" }, 404)
        }

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized access" }, 401)
        }

        return c.json({ data: workspace })
    }
    )
    .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
        const databases = c.get('databases');
        const user = c.get('user');
        const { workspaceId } = c.req.param();


        const member = await getMember({
            databases,
            workspaceId: workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized access" }, 401);
        }

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const thisMonthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]
        );

        const lastMonthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
            ]
        );

        const taskCount = thisMonthTasks.total;
        const taskDifference = taskCount - lastMonthTasks.total;

        const thisMonthAssignedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]
        );

        const lastMonthAssignedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
            ]
        );

        const assignedTaskCount = thisMonthAssignedTasks.total;
        const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

        const thisMonthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]
        );

        const lastMonthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
            ]
        );

        const incompleteTaskCount = thisMonthIncompleteTasks.total;
        const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;


        const thisMonthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]
        );

        const lastMonthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
            ]
        );

        const completedTaskCount = thisMonthCompletedTasks.total;
        const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;


        const thisMonthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", now.toISOString()),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
            ]
        );

        const lastMonthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", now.toISOString()),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
            ]
        );

        const overdueTaskCount = thisMonthOverdueTasks.total;
        const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;


        return c.json({
            data: {
                taskCount,
                taskDifference,
                assignedTaskCount,
                assignedTaskDifference,
                incompleteTaskCount,
                incompleteTaskDifference,
                completedTaskCount,
                completedTaskDifference,
                overdueTaskCount,
                overdueTaskDifference
            }
        });
    })

export default app