import { getCurrentUser } from "@/features/auth/queries"
import { redirect } from "next/navigation";
import ProjectIdClient from "./client";


async function ProjectPage() {
    const user = await getCurrentUser();

    if (!user) redirect("/sign-in")

    return (
        <ProjectIdClient />
    )
}

export default ProjectPage