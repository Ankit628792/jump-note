import React from 'react'
import { Task } from '../types'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'
import DottedSeparator from '@/components/dotted-separator'
import OverviewProperty from './overview-property'
import MemberAvatar from '@/features/members/components/member-avatar'
import TaskDate from './task-date'
import { Badge } from '@/components/ui/badge'
import { snakeToTitlecase } from '@/lib/utils'
import { useEditTaskModal } from '../hooks/use-edit-task-modal'

interface Props {
    task: Task
}

function TaskOverview({ task }: Props) {
    const { open } = useEditTaskModal()
    return (
        <div className='flex flex-col gap-y-4 col-span-1'>
            <div className='bg-muted rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                    <p className='text-lg font-semibold'>Overview</p>
                    <Button onClick={() => open(task.$id)} size={"sm"} variant={"secondary"}>
                        <PencilIcon className='size-4 mr-2' />
                        Edit
                    </Button>
                </div>
                <DottedSeparator className='my-4' />

                <div className='flex flex-col gap-y-2'>
                    <OverviewProperty label='Assignee'>
                        <MemberAvatar name={task.assignee?.name} className='size-6' />
                        <p className='text-sm font-medium'>{task.assignee?.name}</p>
                    </OverviewProperty>
                    <OverviewProperty label='Due date'>
                        <TaskDate value={task.dueDate} className='text-sm font-medium' />
                    </OverviewProperty>
                    <OverviewProperty label='Status'>
                        <Badge variant={task.status}>{snakeToTitlecase(task.status)}</Badge>
                    </OverviewProperty>
                </div>
            </div>
        </div>
    )
}

export default TaskOverview