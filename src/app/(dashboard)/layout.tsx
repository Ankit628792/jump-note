import React from 'react'
import CreateWorkspaceModal from '@/features/workspaces/components/create-workspace-modal'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import CreateProjectModal from '@/features/projects/components/create-project-modal'

function DashboardLayout({ children }: {
    children: React.ReactNode,
}) {
    return (
        <div className="w-full min-h-screen">
            <CreateWorkspaceModal />
            <CreateProjectModal />
            <div className="flex w-full h-full">
                <div className='fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overscroll-y-auto'>
                    <Sidebar />
                </div>
                <div className='lg:pl-[264px] w-full'>
                    <div className='mx-auto max-w-screen-2xl h-full'>
                        <Navbar />
                        <main className='h-full py-8 px-6 flex flex-col'>
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout