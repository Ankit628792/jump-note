import "server-only"
import { Client, Account, Databases } from 'node-appwrite'
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/features/constant";

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)

    const session = await cookies().get(AUTH_COOKIE);

    if (!session || !session.value) {
        throw new Error("Unauthorized access")
    };

    client.setSession(session.value);
    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        }
    };
}

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)
        .setKey(process.env.NEXT_APP_WRITE_KEY!);

    return {
        get account() {
            return new Account(client);
        },
    };
}