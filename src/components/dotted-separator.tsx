import React from 'react'
import { cn } from '@/lib/utils';

interface Props {
    className?: string;
    color?: string;
    height?: string;
    dotSize?: string;
    gapSize?: string;
    direction?: "vertical" | "horizontal";
}

function DottedSeparator({
    className,
    color = "#d4d4d8",
    height = "2px",
    dotSize = "2px",
    gapSize = "6px",
    direction = "horizontal",
}: Props) {
    const isHorizontal = direction === "horizontal";
    return (
        <div className={cn(isHorizontal ? "w-full flex items-center" : "h-full flex flex-col items-center", className)}>
            <div className={isHorizontal ? "flex-grow" : "flex-grow-0"}
                style={{
                    width: isHorizontal ? "100%" : height,
                    height: isHorizontal ? height : "100%",
                    backgroundImage: `radial-gradient(circle, ${color} 35%, transparent 25%)`,
                    backgroundSize: isHorizontal ? `${parseInt(dotSize)}px ${height}` : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
                    backgroundRepeat: isHorizontal ? "repeat-x" : "repeat-y",
                    backgroundPosition: "center",
                }}
            />
        </div>
    )
}

export default DottedSeparator