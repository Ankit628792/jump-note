import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>

export const useRegister = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["register"],
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register["$post"]({ json });
            if (!response.ok) {
                throw new Error("Failed to register")
            }
            return await response.json()
        },
        onSuccess: () => {
            toast.success("Registered successfully!");
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.replace("/")
        },
        onError: (error) => {
            toast.error("Failed to register")
        },
    })
}