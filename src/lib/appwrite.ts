import "server-only"
import { Client, Account } from 'node-appwrite'

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