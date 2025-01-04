import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"

export const useSession = () => {
    return useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const response = await client.api.auth.$get();
            if (!response.ok) {
                return null;
            }
            const { data } = await response.json();
            return data
        },
    })
}