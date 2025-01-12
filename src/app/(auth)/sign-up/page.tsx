import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/queries'
import SignUpCard from '@/features/auth/components/sign-up-card'

async function SignUpPage() {
    const user = await getCurrentUser()
    if (user) return redirect("/")
    return <SignUpCard />
}

export default SignUpPage
