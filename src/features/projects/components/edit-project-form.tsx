"use client"
import React, { ChangeEvent, useRef } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon, ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DottedSeparator from '@/components/dotted-separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { updateProjectSchema } from '../schema';
import { cn } from '@/lib/utils';
import { Project } from '../types';
import { useUpdateProject } from '../api/use-update-project';
import useConfirm from '@/hooks/use-confirm';
import { useDeleteProject } from '../api/use-delete-project';


interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: Project
}

function EditProjectForm({ onCancel, initialValues }: EditProjectFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { mutate, isPending } = useUpdateProject();
    const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject()
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Project",
        "This action cannot be undone.",
        "destructive"
    )

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues?.imageUrl ?? ""
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;
        deleteProject({
            param: { projectId: initialValues?.$id }
        }, {
            onSuccess: () => {
                window.location.href = `/workspaces/${initialValues.workspaceId}`
            }
        })
    }


    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        mutate({ form: finalValues, param: { projectId: initialValues?.$id } })
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
        }
    }



    return (
        <div className='flex flex-col gap-y-4'>
            <DeleteDialog />
            <Card className='w-full h-full border-none shadow-none'>
                <CardHeader className='flex p-7 flex-row items-center gap-x-4 space-y-0'>
                    <Button size={"sm"} variant={"secondary"} onClick={onCancel ? onCancel : () => router.back()}>
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
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type='text'
                                                    placeholder='Enter project name'
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
                                                    <p className='text-sm'>Project Icon</p>
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
                                <Button disabled={isPending || isDeletingProject} type='submit' size={"lg"}>
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
                        <h3 className='font-bold'>Danger Zone</h3>
                        <p className='text-sm text-muted-foreground'>
                            Deleting a project will remove all its associated data. Are you sure you want to proceed?
                        </p>
                        <DottedSeparator className='py-7' />
                        <Button className='w-fit ml-auto' size={"sm"} variant={"destructive"} type='button' disabled={isPending || isDeletingProject} onClick={handleDelete}>
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditProjectForm