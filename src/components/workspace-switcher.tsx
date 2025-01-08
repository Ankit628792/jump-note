"use client"
import { useGetWorkSpaces } from '@/features/workspaces/api/use-get-workspaces'
import React from 'react'
import { RiAddCircleFill } from 'react-icons/ri'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import WorkspaceAvatar from '@/features/workspaces/components/workspace-avatar';
import { cn } from '@/lib/utils';

function WorkspaceSwitcher() {
    const { data: workspaces, isLoading } = useGetWorkSpaces();

    if (isLoading) {
        return null;
    }
    return (
        <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
                <p className='text-xs uppercase text-neutral-500'>Workspaces</p>
                <RiAddCircleFill className='size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition' />
            </div>
            <Select>
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