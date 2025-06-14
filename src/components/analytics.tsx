import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import AnalyticCard from "./analytic-card";
import DottedSeparator from "./dotted-separator";

function Analytics({ data }: ProjectAnalyticsResponseType) {
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0 select-none">
            <div className="w-full flex">
                <div className="flex items-center flex-1">
                    <AnalyticCard title="Total Tasks" value={data.taskCount} variant={data.taskDifference > 0 ? "up" : "down"} increaseValue={data.taskDifference} />
                    <DottedSeparator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticCard title="Assigned Tasks" value={data.assignedTaskCount} variant={data.assignedTaskDifference > 0 ? "up" : "down"} increaseValue={data.assignedTaskDifference} />
                    <DottedSeparator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticCard title="Completed Tasks" value={data.completedTaskCount} variant={data.completedTaskDifference > 0 ? "up" : "down"} increaseValue={data.completedTaskDifference} />
                    <DottedSeparator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticCard title="Overdue Tasks" value={data.overdueTaskCount} variant={data.overdueTaskDifference > 0 ? "up" : "down"} increaseValue={data.overdueTaskDifference} />
                    <DottedSeparator direction="vertical" />
                </div>

                <div className="flex items-center flex-1">
                    <AnalyticCard title="Incomplete Tasks" value={data.incompleteTaskCount} variant={data.incompleteTaskDifference > 0 ? "up" : "down"} increaseValue={data.incompleteTaskDifference} />
                </div>

            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

export default Analytics