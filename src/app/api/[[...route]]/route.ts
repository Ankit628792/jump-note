import { Hono } from 'hono';
import { handle } from "hono/vercel"
import auth from '@/features/auth/server/route'
import workspaces from '@/features/workspaces/server/route'

const app = new Hono().basePath("/api")
    .get("/hello", (c) => {
        return c.json({ ok: true, message: "Hello from Hono API!" });
    })

const routes = app
    .route("/auth", auth)
    .route("/workspaces", workspaces)


export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes