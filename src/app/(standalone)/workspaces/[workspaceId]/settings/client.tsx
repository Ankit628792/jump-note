"use client"
import PageError from '@/components/page-error';
import PageLoader from '@/components/page-loader';
import { useGetWorkSpace } from '@/features/workspaces/api/use-get-workspace';
import EditWorkspaceForm from '@/features/workspaces/components/edit-workspace-form'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import React from 'react'

function WorkspaceSettingsClient() {
    const workspaceId = useWorkspaceId();
    const { data, isLoading } = useGetWorkSpace({ workspaceId });
    if (isLoading) {
        return <PageLoader />
    }
    if (!data) {
        return <PageError message="Workspace not found" />
    }
    return (
        <div className='w-full lg:max-w-xl'>
            <EditWorkspaceForm initialValues={data} />
        </div>
    )
}

export default WorkspaceSettingsClient