import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";
import { AUTH_COOKIE } from "../constant";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { MEMBER_ROLE } from "../members/types";
import { Workspace } from "./types";

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


export const getWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APP_WRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT!)

        const session = await cookies().get(AUTH_COOKIE);
        if (!session) return null;

        client.setSession(session?.value);
        const databases = new Databases(client);
        const account = new Account(client)
        const user = await account.get();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        })

        if (!member || (member.role !== MEMBER_ROLE.ADMIN)) {
            return null;
        }

        const workSpace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        return workSpace;

    } catch (error) {
        return null;
    }
}