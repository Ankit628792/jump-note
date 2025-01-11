import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["createWorkspace"],
        mutationFn: async ({ form }) => {
            const response = await client.api.workspaces["$post"]({ form })
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Workspace created successfully")
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
        onError: (error) => {
            toast.error("Failed to create workspace")
        },
    })
}