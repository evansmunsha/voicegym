"use client";

import { Navbar } from "@/components/Navbar";
import { LANGUAGES } from "@/lib/i18n";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from '../../lib/session';

export default function SettingsPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Navbar title="Settings" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Language</h2>
          <select className="px-4 py-2 rounded border">
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <p className="text-gray-600 mt-2">(UI translation coming soon)</p>
        </div>
      </main>
    </div>
  );
}
