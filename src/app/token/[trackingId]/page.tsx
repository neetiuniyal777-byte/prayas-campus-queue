"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  BellRing, 
  RefreshCw, 
  ShieldCheck,
  ArrowLeft,
  Share2
} from "lucide-react";

interface TokenData {
  id: string;
  label: string;
  number: number;
  service_name: string;
  service_slug: string;
  status: "waiting" | "called" | "serving" | "completed" | "skipped" | "no_show" | "cancelled";
  counter_label?: string | null;
  now_serving_label?: string | null;
  queue_position: number;
  waiting_ahead: number;
  estimated_wait_min: number;
  issued_at: string;
  called_at?: string | null;
  application_status?: string | null;
  application_review_note?: string | null;
  reference_number?: string | null;
}

export default function TokenTrackingPage() {
  const params = useParams();
  const trackingId = params.trackingId as string;

  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);

  function fetchStatus() {
    if (!trackingId) return;
    fetch(`/api/tokens/${trackingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          setLastUpdated(new Date());
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // Poll every 5 seconds for live status updates
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [trackingId]);

  function copyTrackingLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading && !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading your live token...</p>
        </div>
      </div>
    );
  }

  const isCalled = token?.status === "called";
  const isServing = token?.status === "serving";
  const isCompleted = token?.status === "completed";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Called Banner Alert */}
        {isCalled && (
          <div className="bg-emerald-500 text-white p-5 rounded-2xl shadow-lg shadow-emerald-200 animate-bounce flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
                It&apos;s Your Turn!
              </div>
              <div className="text-base font-bold">
                Please proceed to {token?.counter_label || "Counter 1"}
              </div>
            </div>
          </div>
        )}

        {/* Token Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm text-center relative overflow-hidden space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-blue-600 tracking-wider uppercase">
              {token?.service_name || "Student Service"}
            </div>
            <div className="text-xs text-slate-400">Digital Queue Pass</div>
          </div>

          {/* Large Token Badge */}
          <div className="py-2">
            <div
              className={`inline-block text-5xl font-extrabold tracking-tight px-6 py-3 rounded-2xl ${
                isCalled
                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400"
                  : isServing
                  ? "bg-blue-100 text-blue-800 border-2 border-blue-400"
                  : isCompleted
                  ? "bg-slate-100 text-slate-700"
                  : "bg-amber-50 text-amber-900 border-2 border-amber-300"
              }`}
            >
              {token?.label || "B-001"}
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                isCalled
                  ? "bg-emerald-600 text-white"
                  : isServing
                  ? "bg-blue-600 text-white"
                  : isCompleted
                  ? "bg-slate-200 text-slate-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {token?.status}
            </span>
          </div>

          {/* Queue Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Position</div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                #{token?.queue_position || 1}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Ahead</div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                {token?.waiting_ahead || 0}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Est. Wait</div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                ~{token?.estimated_wait_min || 0}m
              </div>
            </div>
          </div>
        </div>

        {/* Live Counter Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Office Counter Status</span>
            </div>
            <button
              onClick={fetchStatus}
              className="text-slate-400 hover:text-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500">Currently Serving:</span>
            <span className="font-bold text-slate-800">
              {token?.now_serving_label || "Calling shortly"}
            </span>
          </div>

          {token?.counter_label && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-xs text-emerald-900 font-bold">
              <span>Your Assigned Counter:</span>
              <span>{token.counter_label}</span>
            </div>
          )}
        </div>

        {/* Application Timeline Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Application Timeline</span>
          </h3>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-slate-800">Application Form Generated & Submitted</div>
                <div className="text-[11px] text-slate-400">PDF successfully archived on server</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  isCalled || isServing || isCompleted ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
                }`}
              />
              <div className="flex-1">
                <div className="font-bold text-slate-800">Waiting in Queue</div>
                <div className="text-[11px] text-slate-400">Staff will call your token on the screen</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  isCompleted ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <div className="flex-1">
                <div className="font-bold text-slate-800">Verification & Certificate Issuance</div>
                <div className="text-[11px] text-slate-400">Original document verification at the counter</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Tracking Link */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold">Keep this page open or copy your link:</span>
            <button
              onClick={copyTrackingLink}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition"
            >
              <Share2 className="w-3 h-3" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Your token updates in real time. Arrive at the counter when called with your original documents.
          </p>
        </div>

        {/* Footer timestamp */}
        <div className="text-center text-[10px] text-slate-400">
          Last synchronized at {lastUpdated.toLocaleTimeString()}
        </div>
      </main>
    </div>
  );
}
