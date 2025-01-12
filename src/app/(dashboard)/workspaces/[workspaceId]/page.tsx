import React from 'react'
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/queries';

async function WorkspaceIdPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/sign-in");
    return (
        <div>WorkspaceIdPage</div>
    )
}

export default WorkspaceIdPage