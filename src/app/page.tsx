import { getCurrentUser } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import UserButton from "@/features/auth/components/user-button";

export default async function Home() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")
  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-5 py-20">
      <UserButton />
    </div>
  );
}
