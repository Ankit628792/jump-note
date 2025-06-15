import React from 'react'
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/queries'
import MembersList from '@/features/members/components/members-list';

async function WorkspaceMembers() {
    const user = await getCurrentUser();
    if (!user) return redirect("/sign-in")
    return (
        <div className='w-full lg:max-w-lg'>
            <MembersList />
        </div>
    )
}

export default WorkspaceMembers
