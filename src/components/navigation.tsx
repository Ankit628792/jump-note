"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from 'react-icons/go'
import { IoSettingsOutline, IoSettings } from 'react-icons/io5'
import { HiMiniUsers, HiOutlineUsers } from 'react-icons/hi2'
import { cn } from '@/lib/utils'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'

const routes = [
    {
        label: "Home",
        href: "/",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill
    },
    {
        label: "Settings",
        href: "/settings",
        icon: IoSettingsOutline,
        activeIcon: IoSettings
    },
    {
        label: "Members",
        href: "/members",
        icon: HiOutlineUsers,
        activeIcon: HiMiniUsers
    },
]

function Navigation() {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();

    return (
        <ul className='flex flex-col'>
            {
                routes.map((item) => {
                    const fullHref = `/workspaces/${workspaceId}${item.href}`
                    const isActive = pathname === fullHref;
                    const Icon = isActive ? item.activeIcon : item.icon;
                    return (
                        <Link key={item.href} href={fullHref}>
                            <div className={cn("flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500 group", isActive && "bg-white shadow-sm hover:opacity-100 text-primary")}>
                                <Icon className='size-5 text-neutral-500 group-hover:text-primary' /> {item.label}
                            </div>
                        </Link>
                    )
                })
            }
        </ul>
    )
}

export default Navigation