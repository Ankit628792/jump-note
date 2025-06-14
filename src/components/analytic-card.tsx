import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    value: number;
    variant: "up" | "down";
    increaseValue: number;
}
function AnalyticCard({
    title, value, variant, increaseValue
}: Props) {
    const iconColor = variant === "up" ? "text-emrald-500" : "text-red-500";
    const increaseValueColor = variant === "up" ? "text-emrald-500" : "text-red-500";
    const Icon = variant === "up" ? FaCaretUp : FaCaretDown;
    return (
        <Card className="shadow-none border-none w-full">
            <CardHeader>
                <div className="flex items-center gap-x-2.5">
                    <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                        <span className="truncate text-base">{title}</span>
                    </CardDescription>
                    <div className="flex items-center gap-x-1">
                        <Icon className={cn(iconColor, "size-4")} />
                        <span className={cn(increaseValueColor, "truncate text-base font-medium")}>
                            {increaseValue}
                        </span>
                    </div>
                </div>
                <CardTitle className="text-3xl font-semibold">
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    )
}

export default AnalyticCard