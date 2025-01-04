import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>

export const useRegister = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["register"],
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register["$post"]({ json })
            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.replace("/");
        },
    })
}