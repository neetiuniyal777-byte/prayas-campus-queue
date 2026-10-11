"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COLLEGE_CONFIG } from "@/config/college";
import { Lock, Mail, Loader2, ArrowLeft, Shield } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/staff");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Portal</span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto border border-[#e2e8f0] rounded-lg p-1.5 bg-white flex items-center justify-center">
              <Image
                src="/logo.png"
                alt={COLLEGE_CONFIG.name}
                width={52}
                height={52}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">
                Staff & Administration Login
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                {COLLEGE_CONFIG.name}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Official Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="staff@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded bg-[#1d4ed8] hover:bg-[#1e40af] font-bold text-xs text-white transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#e2e8f0] text-center text-[11px] text-[#64748b]">
            Secured via Supabase Authentication & Row-Level Authorization
          </div>
        </div>
      </div>
    </div>
  );
}
