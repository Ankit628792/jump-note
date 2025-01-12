import { getCurrentUser } from '@/features/auth/queries'
import { getWorkspace } from '@/features/workspaces/queries'
import EditWorkspaceForm from '@/features/workspaces/components/edit-workspace-form'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
    params: {
        workspaceId: string
    }
}

async function WorkspaceSettingPage({ params }: Props) {
    const user = await getCurrentUser()
    if (!user) return redirect("/sign-in");

    const workspaceId = params.workspaceId

    const initialValues = await getWorkspace({ workspaceId })
    if (!initialValues) return redirect(`/workspaces/${workspaceId}`)

    return (
        <div className='w-full lg:max-w-xl'>
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkspaceSettingPage