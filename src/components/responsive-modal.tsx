import React from 'react'
import { useMedia } from 'react-use'
import { Dialog, DialogContent } from './ui/dialog'
import { Drawer, DrawerContent } from './ui/drawer'

interface Props {
    children: React.ReactNode,
    open: boolean,
    onOpenChange: (open: boolean) => void
}
function ResponsiveModal({
    children,
    open,
    onOpenChange
}: Props) {
    const isDesktop = useMedia("(min-width: 1024px)", true)
    if (isDesktop)
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='w-full sm:max-w-lg p-0 border-none overflow-y-auto max-h-[85vh] hide-scrollbar'>
                    {children}
                </DialogContent>
            </Dialog>
        )

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className='overflow-y-auto max-h-[85vh] hide-scrollbar'>
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ResponsiveModal