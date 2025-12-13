'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'researcher' ? 'researcher' : 'child';
  
  const [mode, setMode] = useState<'child' | 'researcher'>(defaultMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        loginType: mode,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === 'child' 
          ? 'Invalid code or PIN. Please try again.' 
          : 'Invalid email or password.'
        );
      } else {
        router.push(mode === 'child' ? '/dashboard' : '/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-child-xl font-bold text-slate-800 mb-2">
          {mode === 'child' ? 'Welcome!' : 'Researcher Login'}
        </h1>
        <p className="text-slate-600">
          {mode === 'child' 
            ? 'Enter your code to start training' 
            : 'Sign in to manage studies'
          }
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('child')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            mode === 'child'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Child
        </button>
        <button
          type="button"
          onClick={() => setMode('researcher')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            mode === 'researcher'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Researcher
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={mode === 'child' ? 'Your Code' : 'Email'}
          type={mode === 'child' ? 'text' : 'email'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={mode === 'child' ? 'e.g., DEMO01' : 'email@research.edu'}
          required
          autoComplete={mode === 'child' ? 'off' : 'email'}
        />
        
        <Input
          label={mode === 'child' ? 'PIN' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'child' ? '••••' : '••••••••'}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="p-4 bg-danger-50 text-danger-600 rounded-xl text-center">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          {mode === 'child' ? 'Start Training!' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        {mode === 'child' ? (
          <p>Ask your teacher for your code if you forgot it.</p>
        ) : (
          <p>Contact admin if you need access.</p>
        )}
      </div>
    </Card>
  );
}

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>

      {/* Demo credentials hint */}
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>Demo: Child (DEMO01 / 1234) | Admin (admin@research.edu / admin123)</p>
      </div>
    </main>
  );
}
