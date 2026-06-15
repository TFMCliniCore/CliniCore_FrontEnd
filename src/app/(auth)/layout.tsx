'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.length > 20) {
      router.replace('/');
    }
  }, [router]);

  return <>{children}</>;
}