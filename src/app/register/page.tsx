"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect to Clerk sign-up
    router.replace('/sign-up');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <p className="text-center">Redirecting to sign-up...</p>
      </div>
    </div>
  );
}
