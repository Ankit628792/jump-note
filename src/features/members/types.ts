import { Models } from "node-appwrite"

export enum MEMBER_ROLE {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}

export type Member = Models.Document & {
    workspaceId: string
    userId: string
    role: MEMBER_ROLE
}