import DottedSeparator from '@/components/dotted-separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { registerSchema } from '@/features/schema'
import { useRegister } from '../api/use-register'


function SignUpCard() {
    const { mutate } = useRegister();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: '',
            password: '',
        }
    })

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        console.log({ values })
        mutate({ json: values })
    }

    return (
        <Card className='w-full h-full md:w-[520px] border-none shadow-none'>
            <CardHeader className='flex items-center justify-center text-center p-7'>
                <CardTitle className='text-2xl'>
                    Sign Up Now
                </CardTitle>
            </CardHeader>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type='text'
                                            placeholder='Enter name'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='email'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type='email'
                                            placeholder='Enter email address'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='password'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>

                                        <Input
                                            {...field}
                                            type='password'
                                            placeholder='Enter password'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button size={"lg"} className='w-full'>
                            Register
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardContent className='p-7 flex flex-col gap-y-4'>
                <Button
                    disabled={false}
                    variant={"secondary"}
                    size={"lg"}
                    className='w-full'
                >
                    <FcGoogle className='mr-2 size-5' />
                    Login with google
                </Button>
                <Button
                    disabled={false}
                    variant={"secondary"}
                    size={"lg"}
                    className='w-full'
                >
                    <FaGithub className='mr-2 size-5' />
                    Login with Github
                </Button>
            </CardContent>
            <div className='px-7'>
                <DottedSeparator />
            </div>
            <CardDescription className='text-center w-full p-7'>
                Already have an account? {" "}
                <Link href={"/sign-in"}>
                    <span className='text-blue-700'>Sign In</span>
                </Link>{" "}
                now!
            </CardDescription>

            <CardDescription className='w-full p-7 pt-0 text-center'>
                By signing up, you agree to our {" "}
                <Link href={"/"}>
                    <span className='text-blue-700'>Privacy Policy</span>
                </Link>{" and "}
                <Link href={"/"}>
                    <span className='text-blue-700'>Terms of Service</span>
                </Link>
            </CardDescription>
        </Card>
    )
}

export default SignUpCard