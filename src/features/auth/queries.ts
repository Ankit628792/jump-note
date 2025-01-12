"use server"
import { createSessionClient } from "@/lib/appwrite"

export const getCurrentUser = async () => {
    try {
        const { account } = await createSessionClient();
        return await account.get();

    } catch (error) {
        return null;
    }
}