"use client"
import React, { useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from './ui/calendar';


interface Props {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}
const today = new Date(new Date().setDate(new Date().getDate() - 1));

function DatePicker({ placeholder = "Select Date", value, onChange, className }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size={"lg"} variant={"outline"} className={cn("w-full justify-start text-left font-normal px-3", !value && "text-muted-foreground", className)}>
                    <CalendarIcon />
                    {value ? format(value, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>

            <PopoverContent className='w-auto p-0'>
                <Calendar mode='single' selected={value} onSelect={(date) => onChange(date as Date)} initialFocus disabled={(date) => date <= today} />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker