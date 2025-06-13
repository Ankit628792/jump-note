import { getCurrentUser } from '@/features/auth/queries'
import TaskViewSwitcher from '@/features/tasks/components/task-view-switcher';
import { redirect } from 'next/navigation';
import React from 'react'

async function Tasks() {
    const user = await getCurrentUser();

    if (!user) redirect("/sign-in");

    return (
        <div className='h-full flex flex-col'>
            <TaskViewSwitcher />
        </div>
    )
}

export default Tasks