"use client"
import React, { ChangeEvent, useRef } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DottedSeparator from '@/components/dotted-separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCreateWorkspace } from '../api/use-create-workspace';
import { createWorkSpaceSchema } from '../schema';
import { cn } from '@/lib/utils';


interface CreateWorkspaceFormProps {
    onCancel?: () => void;
}

function CreateWorkspaceForm({ onCancel }: CreateWorkspaceFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { mutate, isPending } = useCreateWorkspace();
    const form = useForm<z.infer<typeof createWorkSpaceSchema>>({
        resolver: zodResolver(createWorkSpaceSchema),
        defaultValues: {
            name: '',
        }
    })

    const onSubmit = (values: z.infer<typeof createWorkSpaceSchema>) => {
        console.log(values)
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : ""
        }
        mutate({ form: values }, {
            onSuccess: ({ data }) => {
                form.reset()
                router.push(`/workspaces/${data.$id}`)
            }
        })
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('image', file);
        }
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='flex p-7 '>
                <CardTitle className='text-xl font-bold'>
                    Create a new workspace
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
                                                <Button type='button' disabled={isPending} variant={"tertiary"} size={"xs"} className='w-fit mt-2' onClick={() => inputRef.current?.click()}>
                                                    Upload Image
                                                </Button>
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
                                Create Workspace
                            </Button>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default CreateWorkspaceForm