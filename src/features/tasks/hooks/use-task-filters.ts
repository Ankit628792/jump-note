import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"
import { TaskStatus } from "../types"
import { useProjectId } from "@/features/projects/hooks/use-project-id"

export const useTaskFilters = () => {
    const projectId = useProjectId()
    return useQueryStates({
        projectId: projectId ? parseAsString.withDefault(projectId) : parseAsString,
        status: parseAsStringEnum(Object.values(TaskStatus)),
        assigneeId: parseAsString,
        dueDate: parseAsString,
        search: parseAsString,
    }, {

    })
}