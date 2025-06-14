import { Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
    try {
        const { account, databases } = await createSessionClient();
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


export const getWorkspaceInfo = async ({ workspaceId }: { workspaceId: string }) => {
    try {
        const { account, databases } = await createSessionClient();

        const workSpace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        return {
            name: workSpace.name
        };

    } catch (error) {
        return null;
    }
}