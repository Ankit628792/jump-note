"use server"

import { cookies } from "next/headers"
import { Account, Client } from "node-appwrite"
import { AUTH_COOKIE } from "../constant"

export const getCurrentUser = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)

        const session = await cookies().get(AUTH_COOKIE);

        if (!session) return null;

        client.setSession(session.value);
        const account = new Account(client);

        return await account.get();

    } catch (error) {
        console.log({ error })
        return null;
    }
}