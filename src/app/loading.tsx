import React from 'react'
import { Loader2 } from 'lucide-react'

function Loading() {
    return (
        <div className='w-full min-h-screen flex flex-col items-center justify-center gap-4'>
            <Loader2 className='size-8 text-neutral-700 animate-spin' />
            <p className='text-lg text-neutral-500'>Loading...</p>
        </div>
    )
}

export default Loading