import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    const isProfileComplete = (session.user as any)?.profileComplete;
    if (isProfileComplete) {
      redirect('/dashboard');
    } else {
      redirect('/signup');
    }
  } else {
    redirect('/login');
  }
}
