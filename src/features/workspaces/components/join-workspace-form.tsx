"use client"
import DottedSeparator from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link';
import React from 'react'
import { useJoinWorkspace } from '../api/use-join-workspace';
import { useInviteCode } from '../hooks/use-invite-code';
import { useWorkspaceId } from '../hooks/use-workspace-id';
import { useRouter } from 'next/navigation';


interface Props {
    initialValues: {
        name: string;
    }
}
function JoinWorkspaceForm({ initialValues }: Props) {
    const router = useRouter()
    const inviteCode = useInviteCode();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useJoinWorkspace()

    const onSubmit = () => {
        mutate({
            param: {
                workspaceId,

            },
            json: {
                code: inviteCode
            }
        }, {
            onSuccess: ({ data }) => {
                router.replace(`/workspaces/${data.$id}`)
            }
        })
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='p-7'>
                <CardTitle className='text-xl font-bold'>
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
                </CardDescription>
            </CardHeader>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <div className='flex flex-col lg:flex-row items-center gap-2 justify-between'>
                    <Button disabled={isPending} variant={"secondary"} type="button" size={"lg"} asChild className='w-full lg:w-fit'>
                        <Link href={"/"}>
                            Cancel
                        </Link>
                    </Button>
                    <Button disabled={isPending} onClick={onSubmit} size={"lg"} type='button' className='w-full lg:w-fit'>
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default JoinWorkspaceForm