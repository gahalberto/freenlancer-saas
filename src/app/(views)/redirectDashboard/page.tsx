"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RedirectDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const roleId = session?.user?.roleId;

      if (roleId === 1) {
        router.push('/dashboard/mashguiach');
      } else if (roleId === 2) {
        router.push('/dashboard/owner');
      } else if (roleId === 3) {
        router.push('/dashboard/admin');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <p>Carregando...</p>;
  }

  return null;
};

export default RedirectDashboard;
