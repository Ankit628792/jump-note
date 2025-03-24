"use client"
import React, { ChangeEvent, useRef } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon, CopyIcon, ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DottedSeparator from '@/components/dotted-separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { updateWorkSpaceSchema } from '../schema';
import { cn } from '@/lib/utils';
import { Workspace } from '../types';
import { useUpdateWorkspace } from '../api/use-update-workspace';
import useConfirm from '@/hooks/use-confirm';
import { useDeleteWorkspace } from '../api/use-delete-workspace';
import { toast } from 'sonner';
import { useResetInviteCode } from '../api/use-reset-invite-code';


interface EditWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: Workspace
}

function EditWorkspaceForm({ onCancel, initialValues }: EditWorkspaceFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace()
    const { mutate: resetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode()
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "This action cannot be undone.",
        "destructive"
    )
    const [ResetDialog, confirmReset] = useConfirm(
        "Reset invite link",
        "This will invalidate the current invite link.",
        "destructive"
    )
    const form = useForm<z.infer<typeof updateWorkSpaceSchema>>({
        resolver: zodResolver(updateWorkSpaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues?.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;
        deleteWorkspace({
            param: { workspaceId: initialValues?.$id }
        }, {
            onSuccess: () => {
                window.location.href = "/"
            }
        })
    }


    const handleResetInviteCode = async () => {
        const ok = await confirmReset();
        if (!ok) return;
        resetInviteCode({
            param: { workspaceId: initialValues?.$id }
        }, {
            onSuccess: () => {
                router.refresh();
            }
        })
    }

    const onSubmit = (values: z.infer<typeof updateWorkSpaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        mutate({ form: finalValues, param: { workspaceId: initialValues?.$id } }, {
            onSuccess: ({ data }) => {
                form.reset()
            }
        })
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
        }
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink).then(() => toast.success("Invite link copied to clipboard"));

    }


    return (
        <div className='flex flex-col gap-y-4'>
            <DeleteDialog />
            <ResetDialog />
            <Card className='w-full h-full border-none shadow-none'>
                <CardHeader className='flex p-7 flex-row items-center gap-x-4 space-y-0'>
                    <Button size={"sm"} variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className='size-4 mr-2' />
                        Back
                    </Button>
                    <CardTitle className='text-xl font-bold'>
                        {initialValues?.name}
                    </CardTitle>
                </CardHeader>
                <div className='px-7'>
                    <DottedSeparator />
                </div>
                <CardContent className='p-7'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='flex flex-col gap-y-4'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Workspace Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type='text'
                                                    placeholder='Enter workspace name'
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='image'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-y-2'>
                                            <div className='flex items-center gap-x-5'>
                                                {
                                                    field.value ? (
                                                        <div className='size-[72px] relative rounded-md overflow-hidden'>
                                                            <Image fill className='object-cover' src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value} alt='image' />
                                                        </div>
                                                    )
                                                        : (
                                                            <Avatar className='size-[72px]'>
                                                                <AvatarFallback>
                                                                    <ImageIcon className='size-[36px] text-neutral-400' />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )
                                                }
                                                <div className='flex flex-col'>
                                                    <p className='text-sm'>Workspace Icon</p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        JPG, PNG, SVG or JPEG, Max 1MB
                                                    </p>
                                                    <input onChange={handleImageChange} type="file" className='hidden' accept='.jpg, .png, .jpeg, .svg' ref={inputRef} disabled={isPending} />
                                                    {
                                                        field.value
                                                            ?
                                                            <Button type='button' disabled={isPending} variant={"destructive"} size={"xs"} className='w-fit mt-2' onClick={() => {
                                                                field.onChange(null);
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = "";
                                                                }
                                                            }}>
                                                                Remove Image
                                                            </Button>
                                                            : (
                                                                <Button type='button' disabled={isPending} variant={"tertiary"} size={"xs"} className='w-fit mt-2' onClick={() => inputRef.current?.click()}>
                                                                    Upload Image
                                                                </Button>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeparator className='py-7' />
                            <div className='flex items-center justify-between'>
                                <Button disabled={isPending} type='button' size={"lg"} variant={"secondary"} onClick={onCancel} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button disabled={isPending} type='submit' size={"lg"}>
                                    Save Changes
                                </Button>
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className='w-full h-full border-none shadow-none'>
                <CardContent className='p-7'>
                    <div className='flex flex-col'>
                        <h3 className='font-bold'>Invite Members</h3>
                        <p className='text-sm text-muted-foreground'>
                            Use the invite link to add members to your workspace
                        </p>
                        <div className='mt-4'>
                            <div className='flex items-center gap-x-2'>
                                <Input disabled value={fullInviteLink} />
                                <Button onClick={handleCopyInviteLink} className='size-12' variant={"secondary"}>
                                    <CopyIcon className='size-5' />
                                </Button>
                            </div>
                        </div>
                        <DottedSeparator className='py-7' />
                        <Button className='w-fit ml-auto' size={"sm"} variant={"destructive"} type='button' disabled={isPending || isResettingInviteCode} onClick={handleResetInviteCode}>
                            Reset Invite Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className='w-full h-full border-none shadow-none'>
                <CardContent className='p-7'>
                    <div className='flex flex-col'>
                        <h3 className='font-bold'>Danger Zone</h3>
                        <p className='text-sm text-muted-foreground'>
                            Deleting a workspace will remove all its associated data. Are you sure you want to proceed?
                        </p>
                        <DottedSeparator className='py-7' />
                        <Button className='w-fit ml-auto' size={"sm"} variant={"destructive"} type='button' disabled={isPending || isDeletingWorkspace} onClick={handleDelete}>
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditWorkspaceForm