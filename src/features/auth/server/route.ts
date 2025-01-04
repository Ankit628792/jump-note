import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginSchema, registerSchema } from '@/features/schema'
import { createAdminClient } from '@/lib/appwrite'
import { ID } from 'node-appwrite'
import { deleteCookie, setCookie } from 'hono/cookie'
import { AUTH_COOKIE } from '@/features/contant'
import { sessionMiddleware } from '@/lib/session-middleware'

const loginMiddleware = zValidator("json", loginSchema)
const registerMiddleware = zValidator("json", registerSchema)
const app = new Hono()
    .get("/", sessionMiddleware, (c) => {
        const user = c.get("user");
        return c.json({ data: user })
    })
    .post("/login", loginMiddleware, async (c) => {
        const { email, password } = c.req.valid("json");
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);
        setCookie(c, AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        })
        return c.json({ success: true })
    })
    .post("/register", registerMiddleware, async (c) => {
        const { name, email, password } = c.req.valid("json");
        const { account } = await createAdminClient();
        await account.create(
            ID.unique(),
            email,
            password,
            name
        )

        const session = await account.createEmailPasswordSession(email, password);
        setCookie(c, AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        })
        return c.json({ success: true })
    })
    .post("/logout", sessionMiddleware, async (c) => {
        const account = c.get("account");
        deleteCookie(c, AUTH_COOKIE);
        await account.deleteSession("current");
        return c.json({ success: true })
    })

export default app
