import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { MEMBER_ROLE } from "../members/types";
import { Project } from "./types";

export const getProject = async ({ workspaceId, projectId }: { workspaceId: string; projectId: string }) => {
    try {
        const { account, databases } = await createSessionClient();
        const user = await account.get();

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )
        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
        })

        if (!member) {
            return null;
        }
        return project;

    } catch (error) {
        return null;
    }
}