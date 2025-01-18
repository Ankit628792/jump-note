import React from 'react'
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/queries'
import JoinWorkspaceForm from '@/features/workspaces/components/join-workspace-form';
import { getWorkspaceInfo } from '@/features/workspaces/queries';

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

    const initialValues = await getWorkspaceInfo({
        workspaceId: workspaceId,
    })

    if (!initialValues) return redirect("/");

    return (
        <div className='w-full lg:max-w-xl'>
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default JoinWorkspacePage