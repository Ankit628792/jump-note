import { getCurrentUser } from '@/features/auth/queries'
import { redirect } from 'next/navigation';
import ProjectSettingClient from './client';

async function ProjectSettings() {

    const user = await getCurrentUser();
    if (!user) return redirect("/sign-in");

    return (
        <ProjectSettingClient />
    )
}

export default ProjectSettings