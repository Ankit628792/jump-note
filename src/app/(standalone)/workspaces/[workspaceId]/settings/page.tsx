import { getCurrentUser } from '@/features/auth/queries'
import { redirect } from 'next/navigation'
import React from 'react'
import WorkspaceSettingsClient from './client'


async function WorkspaceSettingPage() {
    const user = await getCurrentUser()
    if (!user) return redirect("/sign-in");

    return (
        <WorkspaceSettingsClient />
    )
}

export default WorkspaceSettingPage