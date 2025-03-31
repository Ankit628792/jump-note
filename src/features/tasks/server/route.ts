import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .get("/",

        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.nativeEnum(TaskStatus).nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
        })),
        async (c) => {
            const { users } = await createAdminClient()
            const user = c.get("user");
            const databases = c.get("databases");
            const { workspaceId, projectId, assigneeId, status, search, dueDate } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt")
            ];
            if (projectId) {
                query.push(Query.equal("projectId", projectId));
            }
            if (assigneeId) {
                query.push(Query.equal("assigneeId", assigneeId));
            }
            if (status) {
                query.push(Query.equal("status", status));
            }
            if (search) {
                query.push(Query.search("name", search));
            }
            if (dueDate) {
                query.push(Query.equal("dueDate", dueDate));
            }
            const tasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                query
            );

            const projectIds = tasks.documents.map(doc => doc.projectId);
            const assigneeIds = tasks.documents.map(doc => doc.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectIds.length > 0
                    ?
                    [
                        Query.contains("$id", projectIds)
                    ]
                    :
                    []
            )
            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0
                    ?
                    [
                        Query.contains("$id", assigneeIds)
                    ]
                    :
                    []
            )

            const assignees = await Promise.all(
                members.documents.map(async (doc) => {
                    const user = await users.get(doc.userId);
                    return { ...doc, name: user.name, email: user.email }
                })
            )

            const populatedTasks = tasks.documents.map(doc => {
                const project = projects.documents.find(p => p.$id === doc.projectId);
                const assignee = assignees.find(a => a.$id === doc.assigneeId);
                return { ...doc, project, assignee }
            })

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks
                }
            })

        }
    )
    .post("/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { name, status, workspaceId, projectId, assigneeId, dueDate } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1)
                ]
            );

            const newPosition = highestPositionTask.documents.length > 0 ? highestPositionTask.documents[0].position + 1000 : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    assigneeId,
                    dueDate,
                    position: newPosition,
                }
            )

            return c.json({ data: task });
        }
    )

export default app;