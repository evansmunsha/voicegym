"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '../../lib/session';

export default function PremiumPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getUserSession();
    if (!user) {
      router.replace('/auth/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="text-center mt-12">Redirecting to login...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Premium Features</h2>
      <p>Welcome to the premium section! Here you can access exclusive content and features.</p>
      {/* ...premium content here... */}
    </div>
  );
}
