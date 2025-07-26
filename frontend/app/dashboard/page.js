'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from './sidebar';
import FileUpload from '../components/FileUpload';

export default function DashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState('schema');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');  // redirect to login if token not found
    } else {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Checking authentication...</p>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar onSelectView={setView} />
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Profiling Insights</h1>
          <p className="text-sm text-gray-400">Upload a CSV to view schema and insights</p>
        </header>
        <FileUpload selectedView={view} />
      </main>
    </div>
  );
}
