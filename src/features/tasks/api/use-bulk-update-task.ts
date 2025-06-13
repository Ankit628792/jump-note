import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>

export const useBulkUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["bulkUpdateTask"],
        mutationFn: async ({ json }) => {
            const response = await client.api.tasks["bulk-update"]["$post"]({ json })
            if (!response.ok) {
                throw new Error("Failed to update tasks")
            }
            return await response.json()
        },
        onSuccess: ({ data }) => {
            toast.success("Tasks updated successfully", {
                id: "bulkUpdate"
            })
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => {
            toast.error("Failed to update tasks")
        },
    })
}