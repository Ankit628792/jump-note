import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";
import { AUTH_COOKIE } from "../constant";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

export const getWorkspaces = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)

        const session = await cookies().get(AUTH_COOKIE);
        if (!session) return { documents: [], total: 0 };

        client.setSession(session?.value);
        const databases = new Databases(client);
        const account = new Account(client)
        const user = await account.get();

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (!members.total) {
            return { documents: [], total: 0 }
        }
        const workspaceIds = members.documents.map(doc => doc.workspaceId)
        const workSpaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds),
                Query.limit(1)
            ],
        )

        return workSpaces;

    } catch (error) {
        return { documents: [], total: 0 };
    }
}