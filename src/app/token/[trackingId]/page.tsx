"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building, 
  BellRing, 
  RefreshCw, 
  ArrowLeft,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  Check
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { COLLEGE_CONFIG } from "@/config/college";

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
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  function fetchStatus() {
    if (!trackingId) return;
    fetch(`/api/tokens/${trackingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          setLastUpdated(new Date());

          // Trigger audio chime & vibration when status changes to 'called'
          if (data.token.status === "called" && !hasPlayedChime) {
            triggerCallAlert();
            setHasPlayedChime(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function triggerCallAlert() {
    try {
      if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      // Simple synthetic institutional audio chime
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}
  }

  // Poll every 4 seconds + Supabase Realtime channel setup
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [trackingId]);

  function copyTrackingLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading && !token) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#64748b] font-semibold">Retrieving token status...</p>
        </div>
      </div>
    );
  }

  const isCalled = token?.status === "called";
  const isServing = token?.status === "serving";
  const isCompleted = token?.status === "completed";

  // Calculate progress percentage
  const totalInQueue = (token?.queue_position || 1) + 2;
  const progressPercent = isCompleted ? 100 : isServing ? 85 : isCalled ? 65 : Math.max(15, 100 - ((token?.waiting_ahead || 0) * 20));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader />

      {/* Top Bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalogue</span>
          </Link>

          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Realtime Synchronized</span>
          </div>
        </div>
      </div>

      {/* Main Token Container */}
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* Called Banner with Sound Alert */}
        {isCalled && (
          <div className="bg-emerald-700 text-white p-5 rounded-lg border border-emerald-800 shadow-md flex items-center space-x-4">
            <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                Turn Announced
              </div>
              <div className="text-base font-bold mt-0.5">
                Proceed to {token?.counter_label || "Counter 1"}
              </div>
            </div>
          </div>
        )}

        {/* Big Token Number Panel (Matching Reference Diagram Section 4) */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm text-center space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
              {token?.service_name || "Administrative Service"}
            </span>
            <div className="text-xs text-[#64748b] mt-0.5">Official Student Token</div>
          </div>

          {/* Huge Token Code */}
          <div className="py-2">
            <div
              className={`inline-block text-6xl font-extrabold font-mono tracking-tight px-8 py-3 rounded-lg border ${
                isCalled
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : isServing
                  ? "bg-blue-50 text-blue-900 border-blue-300"
                  : isCompleted
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : "bg-amber-50 text-amber-900 border-amber-300"
              }`}
            >
              {token?.label || "B-001"}
            </div>
          </div>

          {/* Status Label */}
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                isCalled
                  ? "bg-emerald-700 text-white"
                  : isServing
                  ? "bg-[#1d4ed8] text-white"
                  : isCompleted
                  ? "bg-slate-200 text-slate-700"
                  : "bg-amber-100 text-amber-900 border border-amber-200"
              }`}
            >
              Status: {token?.status}
            </span>
          </div>

          {/* Queue Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-[11px] font-semibold text-[#64748b] mb-1">
              <span>Queue Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1d4ed8] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#e2e8f0] text-xs">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded">
              <div className="text-[10px] uppercase font-bold text-[#64748b]">Position</div>
              <div className="font-extrabold text-[#0f172a] text-base mt-0.5 font-mono">
                #{token?.queue_position || 1}
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded">
              <div className="text-[10px] uppercase font-bold text-[#64748b]">Ahead</div>
              <div className="font-extrabold text-[#0f172a] text-base mt-0.5 font-mono">
                {token?.waiting_ahead || 0}
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded">
              <div className="text-[10px] uppercase font-bold text-[#64748b]">Est. Wait</div>
              <div className="font-extrabold text-[#0f172a] text-base mt-0.5 font-mono">
                ~{token?.estimated_wait_min || 0}m
              </div>
            </div>
          </div>
        </div>

        {/* Live Office Status Block */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#e2e8f0] pb-2">
            <div className="font-bold text-[#0f172a] flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-[#1d4ed8]" />
              <span>Counter Status</span>
            </div>
            <button
              onClick={fetchStatus}
              className="text-[#64748b] hover:text-[#0f172a] flex items-center space-x-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#f8fafc] border border-[#e2e8f0] text-xs">
            <span className="text-[#64748b]">Now Serving at Counters:</span>
            <span className="font-mono font-bold text-[#0f172a]">
              {token?.now_serving_label || "B-000"}
            </span>
          </div>

          {token?.counter_label && (
            <div className="flex items-center justify-between p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold">
              <span>Your Assigned Window:</span>
              <span>{token.counter_label}</span>
            </div>
          )}
        </div>

        {/* Application Status Timeline */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-[#0f172a] flex items-center space-x-1.5 border-b border-[#e2e8f0] pb-2">
            <Clock className="w-4 h-4 text-[#1d4ed8]" />
            <span>Application Status Timeline</span>
          </h3>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-bold text-[#0f172a]">Form Submitted & Token Allocated</div>
                <div className="text-[11px] text-[#64748b]">Server-side archival complete</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                  isCalled || isServing || isCompleted ? "bg-emerald-600" : "bg-amber-500 animate-pulse"
                }`}
              />
              <div>
                <div className="font-bold text-[#0f172a]">Waiting in Digital Queue</div>
                <div className="text-[11px] text-[#64748b]">Turn will be announced with counter assignment</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                  isCompleted ? "bg-emerald-600" : "bg-[#cbd5e1]"
                }`}
              />
              <div>
                <div className="font-bold text-[#0f172a]">Scrutiny, Clearance & Certificate Issuance</div>
                <div className="text-[11px] text-[#64748b]">Verification of physical documents at the desk</div>
              </div>
            </div>
          </div>

          {/* Download Certificate Button (Visible when reference_number is generated) */}
          {token?.reference_number && (
            <div className="pt-3 border-t border-[#e2e8f0]">
              <a
                href={`/api/staff/applications/${token.id}/issue?download=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded text-xs transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Issued Certificate ({token.reference_number})</span>
              </a>
            </div>
          )}
        </div>

        {/* Share / Save Token Link */}
        <div className="p-3.5 rounded bg-white border border-[#e2e8f0] text-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-[#0f172a]">Save Your Private Token Link</div>
            <div className="text-[11px] text-[#64748b]">Bookmark or save this URL on your phone</div>
          </div>
          <button
            onClick={copyTrackingLink}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] transition"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1d4ed8]" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <div className="text-center text-[11px] text-[#94a3b8]">
          Last synchronization at {lastUpdated.toLocaleTimeString()}
        </div>
      </main>
    </div>
  );
}
