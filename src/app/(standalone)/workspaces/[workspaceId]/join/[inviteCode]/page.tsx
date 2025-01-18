import { getCurrentUser } from '@/features/auth/queries'
import JoinWorkspaceForm from '@/features/workspaces/components/join-workspace-form';
import { getWorkspaceInfo } from '@/features/workspaces/queries';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    params: {
        workspaceId: string;
        inviteCode: string;
    }
}

async function JoinWorkspacePage({ params }: Props) {
    const user = await getCurrentUser();
    if (!user) return redirect("/sign-in")
    const { workspaceId, inviteCode } = params;

    const workspace = await getWorkspaceInfo({
        workspaceId: workspaceId,
    })

    if (!workspace) return redirect("/");

    return (
        <div className='w-full lg:max-w-xl'>
            <JoinWorkspaceForm initialValues={workspace} />
        </div>
    )
}

export default JoinWorkspacePage