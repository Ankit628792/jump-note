
import { getCurrentUser } from '@/features/auth/queries'
import { redirect } from 'next/navigation';
import React from 'react'
import { TaskIdClient } from './client';

async function TaskDetails() {

    const user = await getCurrentUser();

    if (!user) redirect("/sign-in");

    return <TaskIdClient />
}

export default TaskDetails