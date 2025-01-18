"use client"
import React, { Fragment } from 'react'
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '../../workspaces/hooks/use-workspace-id'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import DottedSeparator from '@/components/dotted-separator';
import { useGetMembers } from '@/features/members/api/use-get-members';
import MemberAvatar from './member-avatar';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDeleteMember } from '../api/use-delete-member';
import { useUpdateMember } from '../api/use-update-member';
import { MEMBER_ROLE } from '../types';
import useConfirm from '@/hooks/use-confirm';

function MembersList() {
    const router = useRouter()
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "Are you sure you want to remove?",
        "destructive"
    )
    const { data } = useGetMembers({ workspaceId })
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

    const handleUpdateMember = (memberId: string, role: MEMBER_ROLE) => {
        updateMember({
            json: { role },
            param: { memberId }
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();
        if (!ok) return;
        deleteMember({
            param: { memberId }
        }, {
            onSuccess: () => {
                router.refresh()
            }
        })
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
                <ConfirmDialog />
                <Button asChild variant={"secondary"} size={"sm"}>
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className='size-4 mr-2' />
                        Back
                    </Link>
                </Button>
                <CardTitle className='text-xl font-bold'>
                    Members List
                </CardTitle>
            </CardHeader>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                {
                    data?.documents.map((member, index) => {
                        return (
                            <Fragment key={member.$id}>
                                <div className='flex items-center gap-2'>
                                    <MemberAvatar className='size-10' fallbackClassName='text-lg' name={member.name} />
                                    <div className='flex flex-col'>
                                        <p className='text-sm font-medium'>{member.name}</p>
                                        <p className='text-xs text-muted-foreground'>{member.email}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className='ml-auto focus-visible:ring-0' variant={"secondary"} size={"icon"}>
                                                <MoreVerticalIcon className='size-4 text-muted-foreground' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='bottom' align='end'>
                                            <DropdownMenuItem className='font-medium' disabled={isUpdatingMember} onClick={() => handleUpdateMember(member.$id, MEMBER_ROLE.ADMIN)}>
                                                Set as Administrator
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='font-medium' disabled={isUpdatingMember} onClick={() => handleUpdateMember(member.$id, MEMBER_ROLE.MEMBER)}>
                                                Set as Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className='font-medium text-amber-700' disabled={isDeletingMember} onClick={() => handleDeleteMember(member.$id)}>
                                                Remove {member.name}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {
                                    index < data.documents.length - 1 && <Separator className='my-2.5' />
                                }
                            </Fragment>
                        )
                    })
                }
            </CardContent>
        </Card>
    )
}

export default MembersList