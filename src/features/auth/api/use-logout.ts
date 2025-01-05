import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>

export const useLogout = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation<ResponseType, Error>({
        mutationKey: ["logout"],
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]()
            return await response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
            router.replace("/sign-in")
        },
    })
}