export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Campus Token System is running
        </h1>
        <p className="text-sm text-slate-600">
          Phase 0 environment, Next.js App Router, Tailwind CSS, and Supabase integration initialized successfully.
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Health check ready at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/api/health</code></span>
        </div>
      </div>
    </main>
  );
}
