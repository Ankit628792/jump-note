import React, { useState } from 'react'
import ResponsiveModal from '@/components/responsive-modal';
import { Button, ButtonProps } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function useConfirm(title: string, message: string, variant: ButtonProps["variant"] = "primary"): [() => JSX.Element, () => Promise<unknown>] {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve })
        })
    }

    const handleClose = () => {
        setPromise(null);
    }
    const handleCancel = () => {
        if (promise) {
            promise.resolve(false)
            handleClose();
        }
    }

    const handleConfirm = () => {
        if (promise) {
            promise.resolve(true)
            handleClose();
        }
    }

    const ConfirmationDialog = () => {
        return <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
            <Card className='w-full h-full border-none shadow-none'>
                <CardContent className='pt-8'>
                    <CardHeader className='p-0'>
                        <CardTitle>
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {message}
                        </CardDescription>
                    </CardHeader>
                    <div className='pt-4 w-full flex flex-col gap-2 lg:flex-row items-center justify-end'>
                        <Button onClick={handleCancel} variant={"outline"} className='w-full lg:w-auto'>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} variant={variant} className='w-full lg:w-auto'>
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    }

    return [ConfirmationDialog, confirm]
}

export default useConfirm