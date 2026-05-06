'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = 'auth=; Max-Age=0; path=/';
    setTimeout(() => {
      router.push('/login');
    }, 100);
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <p className="text-zinc-400">已退出，跳转中...</p>
    </div>
  );
}
