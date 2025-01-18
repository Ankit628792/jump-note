import { Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { MEMBER_ROLE } from "../members/types";
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


export const getWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
    try {
        const { account, databases } = await createSessionClient();
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