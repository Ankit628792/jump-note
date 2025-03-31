import { getCurrentUser } from '@/features/auth/queries'
import EditProjectForm from '@/features/projects/components/edit-project-form';
import { getProject } from '@/features/projects/queries';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    params: {
        workspaceId: string,
        projectId: string
    }
}

async function ProjectSettings({ params }: Props) {

    const user = await getCurrentUser();
    if (!user) return redirect("/sign-in");

    const initialValues = await getProject({
        projectId: params.projectId,
        workspaceId: params.workspaceId,
    })

    if (!initialValues) return redirect(`/workspaces/${params.workspaceId}/projects/${params.projectId}`)

    return (
        <div className='w-full lg:max-w-xl'>
            <EditProjectForm initialValues={initialValues} />
        </div>
    )
}

export default ProjectSettings