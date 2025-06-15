"use client"
import React from 'react'
import UserButton from '@/features/auth/components/user-button'
import MobileSidebar from './mobile-sidebar'
import { usePathname } from 'next/navigation'

const pathnameMap = {
    "tasks": {
        title: "Tasks",
        description: "Monitor all of your project's task"
    },
    "projects": {
        title: "Projects",
        description: "View tasks of your project here"
    },
    "members": {
        title: "Members",
        description: ""
    },
    "settings": {
        title: "Settings",
        description: "Monitor all of your project's task"
    },
    "workspace": {
        title: "Workspace",
        description: "Monitor all of your project's task"
    }
}

const defaultMap = {
    title: "Home",
    description: "Monitor all of your projects and tasks here"
}

function Navbar() {
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnmaeKey = pathnameParts[3] as keyof typeof pathnameMap;
    const { title, description } = pathnameMap[pathnmaeKey] || defaultMap;
    return (
        <nav className='pt-4 px-6 flex items-center justify-between w-full'>
            <div className='flex-col hidden lg:flex'>
                <h1 className='text-2xl font-semibold'>{title}</h1>
                <p className='text-muted-foreground'>{description}</p>
            </div>
            <MobileSidebar />
            <UserButton />
        </nav>
    )
}

export default Navbar