"use client"
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/api/use-logout";
import { useSession } from "@/features/auth/api/use-session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()
  const { data, isFetching } = useSession()
  const { mutate: logout, isPending } = useLogout()

  useEffect(() => {
    if (!data && !isFetching) {
      router.replace("/sign-in")
    }
  }, [data])

  if (isFetching || !data) {
    return <div className="text-2xl text-center py-20">Loading...</div>
  }
  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-5 py-20">
      <h1 className="text-2xl">{data?.name} is Successfully Logged In</h1>
      <Button disabled={isPending} onClick={() => logout()}>
        Log Out
      </Button>
    </div>
  );
}
