import { getCurrentUser } from "@/features/auth/actions";
import { getWorkspaces } from "@/features/workspaces/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in");

  const workspaces = await getWorkspaces();
  if (workspaces.total) {
    return redirect(`/workspaces/${workspaces.documents[0].$id}`)
  }
  else {
    return redirect("/workspaces/create")
  }
}
