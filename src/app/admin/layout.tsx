"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getSession } from '@/lib/firebase/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  useEffect(() => {
    const session = getSession();
    console.log(session)
    if (!session || session.userType !== 'admins') {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
