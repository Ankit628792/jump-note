import React, { useEffect, useState } from 'react'
import { Task } from '../types'
import { Button } from '@/components/ui/button'
import { PencilIcon, XIcon } from 'lucide-react'
import DottedSeparator from '@/components/dotted-separator'
import { useUpdateTask } from '../api/use-update-task'
import { Textarea } from '@/components/ui/textarea'

interface Props {
    task: Task
}

function TaskDescription({ task }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description || "");
    const { mutate, isPending } = useUpdateTask();

    useEffect(() => {
        if (task?.description) setValue(task.description);
    }, [task?.description])

    const handleSave = () => {
        mutate({
            json: {
                description: value
            },
            param: {
                taskId: task.$id
            }
        }, {
            onSuccess: () => setIsEditing(false)
        })
    }
    return (
        <div className='p-4 border rounded-lg'>
            <div className='flex items-center justify-between'>
                <p className='text-lg font-semibold'>Overview</p>
                <Button onClick={() => setIsEditing((prev) => !prev)} size={"sm"} variant={"secondary"}>
                    {
                        isEditing
                            ?
                            <>
                                <XIcon className='size-4' />
                                Cancel
                            </>
                            :
                            <>
                                <PencilIcon className='size-4' />
                                Edit
                            </>
                    }
                </Button>
            </div>

            <DottedSeparator className='my-4' />

            {
                isEditing
                    ?
                    <div className='flex flex-col gap-y-4'>
                        <Textarea placeholder='Add a description' value={value} rows={4} onChange={e => setValue(e.target.value)} disabled={isPending} />
                        <Button size={"sm"} onClick={handleSave} disabled={isPending} className='w-fit ml-auto'>
                            {
                                isPending
                                    ?
                                    "Saving..."
                                    :
                                    "Save"
                            }
                        </Button>
                    </div>
                    :
                    <div>
                        {task.description || (<span className='text-muted-foreground'>No Description provide</span>)}
                    </div>
            }
        </div>
    )
}

export default TaskDescription