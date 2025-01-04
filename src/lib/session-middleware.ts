import "server-only"
import {
    Client, Account, Storage, Databases,

    type Account as AccountType,
    type Databases as DatabasesType,
    type Storage as StorageType,
    type Users as UsersType,
    Models,
} from 'node-appwrite'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { AUTH_COOKIE } from "@/features/contant"

type AdditionalContext = {
    Variables: {
        account: AccountType,
        databases: DatabasesType,
        storage: StorageType,
        users: UsersType,
        user: Models.User<Models.Preferences>
    }
}

export const sessionMiddleware = createMiddleware<AdditionalContext>(async (c, next) => {
    const sessionSecret = getCookie(c, AUTH_COOKIE);
    if (!sessionSecret) {
        return c.json({ error: "Unauthorized access" }, 401)
    }

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)
        .setSession(sessionSecret);

    const account = new Account(client);
    const databases = new Databases(client);
    const storage = new Storage(client);

    const user = await account.get();

    c.set("account", account);
    c.set('databases', databases);
    c.set('storage', storage);
    c.set('user', user);

    return next();
})

