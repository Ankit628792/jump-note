"use client"
import DottedSeparator from '@/components/dotted-separator'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader, PlusIcon } from 'lucide-react'
import React, { useCallback } from 'react'
import { useCreateTaskModal } from '../hooks/use-create-task-modal'
import { useGetTasks } from '../api/use-get-tasks'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { useQueryState } from 'nuqs'
import DataFilters from './data-filters'
import { useTaskFilters } from '../hooks/use-task-filters'
import { DataTable } from './data-table'
import { columns } from './columns'
import DataKanban from './data-kanban'
import { TaskStatus } from '../types'
import { useBulkUpdateTask } from '../api/use-bulk-update-task'
import DataCalendar from './data-calendar'

interface Props {
    hideProjectFilter?: boolean
}

function TaskViewSwitcher({ hideProjectFilter }: Props) {
    const [{
        projectId,
        status,
        assigneeId,
        dueDate,
        search,
    }] = useTaskFilters();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table"
    })
    const { open } = useCreateTaskModal()
    const workspaceId = useWorkspaceId();
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId, assigneeId, status, search, projectId, dueDate });

    const { mutate: bulkUpdate } = useBulkUpdateTask()

    const onKanbanChange = useCallback((tasks: { $id: string; status: TaskStatus; position: number }[]) => {
        bulkUpdate({
            json: {
                tasks
            }
        })
    }, [bulkUpdate])

    return (
        <Tabs defaultValue={view} onValueChange={setView} className='flex-1 w-full border rounded-lg'>
            <div className='h-full flex flex-col overflow-auto p-4'>
                <div className='flex flex-col gap-y-2 lg:flex-row justify-between items-center'>
                    <TabsList className='w-full lg:w-auto'>
                        <TabsTrigger className='h-8 w-full lg:w-auto' value='table'>
                            Table
                        </TabsTrigger>
                        <TabsTrigger className='h-8 w-full lg:w-auto' value='kanban'>
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger className='h-8 w-full lg:w-auto' value='calendar'>
                            Calender
                        </TabsTrigger>
                    </TabsList>
                    <Button onClick={() => open()} size={"sm"} className='w-full lg:w-auto'>
                        <PlusIcon className='size-4' />
                        <span>New</span>
                    </Button>
                </div>

                <DottedSeparator className='my-4' />
                <DataFilters hideProjectFilter={hideProjectFilter} />
                <DottedSeparator className='my-4' />

                {
                    isLoadingTasks
                        ?
                        <div className='w-full border rounded-lg h-60 flex flex-col items-center justify-center'>
                            <Loader className='size-5 animate-spin text-muted-foreground' />
                        </div>
                        :

                        <>
                            <TabsContent value='table' className='mt-0'>
                                <DataTable columns={columns} data={tasks?.documents ?? []} />
                            </TabsContent>
                            <TabsContent value='kanban' className='mt-0'>
                                <DataKanban onChange={onKanbanChange} data={tasks?.documents ?? []} />
                            </TabsContent>
                            <TabsContent value='calendar' className='mt-0'>
                                <DataCalendar data={tasks?.documents ?? []} />
                            </TabsContent>
                        </>
                }
            </div>
        </Tabs>
    )
}

export default TaskViewSwitcher