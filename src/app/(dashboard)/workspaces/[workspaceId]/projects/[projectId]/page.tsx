import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries"
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { getProject } from "@/features/projects/queries";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
    params: {
        workspaceId: string,
        projectId: string
    }
}

async function ProjectPage({ params }: Props) {
    const user = await getCurrentUser();

    if (!user) redirect("/sign-in")

    const intialValues = await getProject({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
    })

    if (!intialValues) {
        throw new Error("Project not found")
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar image={intialValues.imageUrl} name={intialValues?.name} className="size-8" />
                    <p className="font-semibold text-lg">{intialValues.name}</p>
                </div>

                <div>
                    <Button variant={"secondary"} size={"sm"} asChild>
                        <Link href={`/workspaces/${intialValues.workspaceId}/projects/${intialValues.$id}/settings`}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProjectPage