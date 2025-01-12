"use client"
import React from 'react'
import { useRouter } from 'next/navigation';
import { RiAddCircleFill } from 'react-icons/ri'
import { useGetWorkSpaces } from '@/features/workspaces/api/use-get-workspaces'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import WorkspaceAvatar from '@/features/workspaces/components/workspace-avatar';
import { useCreateWorkspaceModal } from '@/features/workspaces/hooks/use-create-workspace-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function WorkspaceSwitcher() {
    const { data: workspaces, isLoading } = useGetWorkSpaces();
    const router = useRouter()
    const workspaceId = useWorkspaceId();


    const { open } = useCreateWorkspaceModal();
    const onSelect = (id: string) => {
        router.push(`/workspaces/${id}`)
    }
    if (isLoading) {
        return null;
    }
    return (
        <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
                <p className='text-xs uppercase text-neutral-500'>Workspaces</p>
                <RiAddCircleFill onClick={open} className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition' />
            </div>
            <Select onValueChange={onSelect} value={workspaceId}>
                <SelectTrigger className='w-full bg-neutral-200 font-medium py-1 px-2'>
                    <SelectValue placeholder={`No workspace ${workspaces?.documents.length ? "selected" : "available"}`} />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.documents.map((workspace) => (
                        <SelectItem key={workspace.$id} value={workspace.$id} className='cursor-pointer'>
                            <div className='flex justify-start items-center gap-3 font-medium'>
                                <WorkspaceAvatar image={workspace.imageUrl} name={workspace.name} />
                                <span className='truncate'>
                                    {workspace.name}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default WorkspaceSwitcher