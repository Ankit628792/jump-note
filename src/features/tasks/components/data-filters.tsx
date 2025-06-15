
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { FolderIcon, ListChecksIcon, UserIcon } from 'lucide-react';
import React from 'react'
import { TaskStatus } from '../types';
import { useTaskFilters } from '../hooks/use-task-filters';
import DatePicker from '@/components/date-picker';

interface Props {
    hideProjectFilter?: boolean
}

function DataFilters({ hideProjectFilter }: Props) {
    const workspaceId = useWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const isLoading = isLoadingProjects || isLoadingMembers

    const projectOptions = projects?.documents.map((doc) => ({
        value: doc.$id,
        label: doc.name
    }))

    const memberOptions = members?.documents.map((doc) => ({
        value: doc.$id,
        label: doc.name
    }))

    const [{
        projectId,
        status,
        assigneeId,
        dueDate,
    }, setFilters] = useTaskFilters();

    const onStatusChange = (value: string) => {
        if (value === "all") {
            setFilters({ status: null })
        }
        else {
            setFilters({ status: value as TaskStatus })
        }
    }
    const onAssigneeChange = (value: string) => {
        if (value === "all") {
            setFilters({ assigneeId: null })
        }
        else {
            setFilters({ assigneeId: value as string })
        }
    }
    const onProjectChange = (value: string) => {
        if (value === "all") {
            setFilters({ projectId: null })
        }
        else {
            setFilters({ projectId: value as string })
        }
    }

    if (isLoading) {
        return null;
    }

    return (
        <div className='flex flex-col lg:flex-row gap-2'>
            <Select defaultValue={status ?? undefined} onValueChange={(value) => onStatusChange(value)}>
                <SelectTrigger className='w-full lg:w-auto h-8'>
                    <div className='flex items-center pr-2'>
                        <ListChecksIcon className='size-4 mr-2' />
                        <SelectValue placeholder="All statuses" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
            </Select>

            <Select defaultValue={assigneeId ?? undefined} onValueChange={(value) => onAssigneeChange(value)}>
                <SelectTrigger className='w-full lg:w-auto h-8'>
                    <div className='flex items-center pr-2'>
                        <UserIcon className='size-4 mr-2' />
                        <SelectValue placeholder="All assignees" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All assignees</SelectItem>
                    <SelectSeparator />
                    {
                        memberOptions?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>

            {
                !hideProjectFilter &&
                <Select defaultValue={projectId ?? undefined} onValueChange={(value) => onProjectChange(value)}>
                    <SelectTrigger className='w-full lg:w-auto h-8'>
                        <div className='flex items-center pr-2'>
                            <FolderIcon className='size-4 mr-2' />
                            <SelectValue placeholder="All projects" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All projects</SelectItem>
                        <SelectSeparator />
                        {
                            projectOptions?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            }
            <DatePicker
                placeholder='Due Date'
                className='w-full h-8 lg:w-auto'
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(value) => setFilters({ dueDate: value ? value.toISOString() : null })}
            />
        </div>
    )
}

export default DataFilters