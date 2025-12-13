import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
          Visual Training Platform
        </h1>
        <p className="text-child-base text-slate-600 mb-8">
          Fun exercises to train your visual skills!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-primary">
            Start Training
          </Link>
          <Link href="/login?mode=researcher" className="btn-secondary">
            Researcher Login
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-50 blur-xl" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-success-200 rounded-full opacity-50 blur-xl" />
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-warning-200 rounded-full opacity-50 blur-xl" />
    </main>
  );
}

