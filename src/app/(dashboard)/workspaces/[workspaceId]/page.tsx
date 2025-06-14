import React from 'react'
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/queries';
import WorkspaceClient from './client';

async function WorkspaceIdPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/sign-in");
    return (
        <WorkspaceClient />
    )
}

export default WorkspaceIdPage