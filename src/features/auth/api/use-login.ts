import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>

export const useLogin = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation<ResponseType, Error, RequestType>({
        mutationKey: ["login"],
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.login["$post"]({ json })
            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.replace("/");
        },
    })
}