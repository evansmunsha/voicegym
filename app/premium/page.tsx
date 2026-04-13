"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '../../lib/session';

export default function PremiumPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

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
      <div className="mt-6">
        <p className="mb-4">Upgrade to Premium to unlock advanced feedback, lesson packs, and priority processing.</p>
        <button
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-semibold"
          disabled={isProcessing}
          onClick={async () => {
            setIsProcessing(true);
            try {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: getUserSession()?.id || null, successUrl: window.location.origin + '/premium?success=1', cancelUrl: window.location.origin + '/premium?canceled=1' }),
              });
              const json = await res.json();
              if (json.url) {
                window.location.href = json.url;
                return;
              }
              alert(json.error || 'Failed to create checkout session');
            } catch (e) {
              console.error(e);
              alert('Checkout failed');
            } finally {
              setIsProcessing(false);
            }
          }}
        >
          {isProcessing ? 'Redirecting...' : 'Upgrade to Premium'}
        </button>
      </div>
    </div>
  );
}
