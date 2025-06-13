import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
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
            const tasks = await databases.listDocuments<Task>(
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
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            )

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

            await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

            return c.json({ data: { $id: task.$id } });
        }
    )
    .patch("/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchema.partial()),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();
            const { name, status, projectId, assigneeId, dueDate, description } = c.req.valid("json");

            const isTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            if (!isTask) {
                return c.json({ error: "Task not found" }, 404)
            }

            const member = await getMember({
                databases,
                workspaceId: isTask.workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }


            const task = await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    assigneeId,
                    dueDate,
                    description
                }
            )

            return c.json({ data: task });
        }
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { users } = await createAdminClient();
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            )

            if (!task) {
                return c.json({ error: "Task not found" }, 404)
            }

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId,
            )

            const assignedUser = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            )

            const assignee = await users.get(assignedUser.userId);

            assignee["name"] = assignedUser.name;
            assignee["email"] = assignedUser.email;

            return c.json({ data: { ...task, project, assignee } });
        }
    )
    .post(
        "/bulk-update",
        sessionMiddleware,
        zValidator("json", z.object({
            tasks: z.array(
                z.object({
                    $id: z.string(),
                    status: z.nativeEnum(TaskStatus),
                    position: z.number().int().positive().min(1000).max(1_000_000)
                })
            ),
        })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { tasks } = c.req.valid("json");

            const tasksToUpdate = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.contains("$id", tasks.map(t => t.$id))
                ]
            )

            const workSpaceIds = new Set(tasksToUpdate.documents.map(t => t.workspaceId));

            if (workSpaceIds.size !== 1) {
                return c.json({ error: "All tasks must be in the same workspace" }, 400)
            }

            const workspaceId = workSpaceIds.values().next().value as string;

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Unauthorized access" }, 401)
            }

            const updatedTasks = await Promise.all(tasks.map(async (task) => {
                await databases.updateDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    task.$id,
                    {
                        status: task.status,
                        position: task.position
                    }
                )
            }))

            return c.json({ data: updatedTasks });

        }
    )

export default app;