import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/queries'
import SignInCard from '@/features/auth/components/sign-in-card'

async function SignInPage() {
    const user = await getCurrentUser()
    if (user) return redirect("/")
    return <SignInCard />
}

export default SignInPage
