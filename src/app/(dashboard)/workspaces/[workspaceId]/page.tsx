import { getCurrentUser } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import React from 'react'

async function WorkspaceIdPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/sign-in");
    return (
        <div>WorkspaceIdPage</div>
    )
}

export default WorkspaceIdPage