"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import LoginForm from '@/components/login/LoginForm';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Login to Continue"
      subtitle="Sign in to your account"
      footerContent={
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign up now
          </Link>
        </p>
      }
    >
      <LoginForm onLoginSuccess={handleLoginSuccess} isPage={true} />
    </AuthLayout>
  );
}
