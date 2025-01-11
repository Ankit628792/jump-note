import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/rpc"

export const useGetWorkSpaces = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            const response = await client.api.workspaces.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch workspace")
            }
            const { data } = await response.json();
            return data
        },
    })
}