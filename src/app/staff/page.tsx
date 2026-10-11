"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  FileText, 
  LogOut,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { createClient } from "@/lib/supabase/client";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCounterId, setSelectedCounterId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  function loadQueue() {
    fetch("/api/staff/queue")
      .then((res) => {
        if (res.status === 401) {
          router.push("/staff/login");
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          if (d.counters?.length && !selectedCounterId) {
            setSelectedCounterId(d.counters[0].id);
          }
          if (d.services?.length && !selectedServiceId) {
            setSelectedServiceId(d.services[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleCallNext() {
    if (!selectedCounterId || !selectedServiceId) {
      alert("Please select your active counter and service.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/staff/call-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterId: selectedCounterId,
          serviceId: selectedServiceId,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || "No waiting tokens for this service.");
      }
      loadQueue();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetStatus(tokenId: string, status: string) {
    setActionLoading(true);
    try {
      await fetch(`/api/staff/tokens/${tokenId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadQueue();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTogglePause(serviceId: string, currentStatus: string) {
    const newStatus = currentStatus === "paused" ? "open" : "paused";
    await fetch(`/api/staff/services/${serviceId}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadQueue();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/staff/login");
  }

  const currentServingToken = data?.activeTokens?.find(
    (t: any) => t.counter_id === selectedCounterId
  ) || data?.activeTokens?.[0];

  const waitingList = (data?.waitingTokens || []).filter((t: any) =>
    t.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.student_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.tuf_id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader subtitle="STAFF ADMINISTRATION & QUEUE CONTROLLER" showStaffLink={false} />

      {/* Control Navigation Bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-[#0f172a]">Staff: {data?.staff?.full_name || "Official"}</span>
            <span className="text-[#64748b]">|</span>
            <span className="px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] font-mono text-[11px] font-bold">
              Role: {data?.staff?.role || "Staff"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Counter Picker Dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#64748b] font-medium">Counter:</span>
              <select
                value={selectedCounterId}
                onChange={(e) => setSelectedCounterId(e.target.value)}
                className="p-1.5 text-xs rounded border border-[#cbd5e1] bg-white font-bold text-[#0f172a]"
              >
                {data?.counters?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Scope Dropdown */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#64748b] font-medium">Service:</span>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="p-1.5 text-xs rounded border border-[#cbd5e1] bg-white font-bold text-[#0f172a]"
              >
                {data?.services?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.prefix})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSignOut}
              className="text-xs font-semibold px-2.5 py-1.5 rounded border border-[#cbd5e1] hover:bg-red-50 hover:text-red-700 text-[#475569] flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Daily Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-3.5 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#64748b]">Total Issued Today</div>
            <div className="text-xl font-bold font-mono text-[#0f172a] mt-0.5">
              {data?.stats?.totalIssued || 0}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg p-3.5 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#64748b]">Waiting In Queue</div>
            <div className="text-xl font-bold font-mono text-[#1d4ed8] mt-0.5">
              {data?.stats?.waiting || 0}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg p-3.5 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#64748b]">Served & Completed</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {data?.stats?.served || 0}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-lg p-3.5 shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#64748b]">Skipped / No Show</div>
            <div className="text-xl font-bold font-mono text-red-700 mt-0.5">
              {data?.stats?.skipped || 0}
            </div>
          </div>
        </div>

        {/* Operational Section: Now Serving + Quick Action Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Now Serving Panel */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
                  Active Counter Window
                </span>
                <h2 className="text-lg font-bold text-[#0f172a] mt-0.5">
                  Currently Serving Token
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-mono font-bold text-[#0f172a]">
                {data?.counters?.find((c: any) => c.id === selectedCounterId)?.label || "Counter 1"}
              </span>
            </div>

            {currentServingToken ? (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] text-center space-y-2">
                  <div className="text-5xl font-extrabold font-mono text-[#0f172a] tracking-tight">
                    {currentServingToken.label}
                  </div>
                  <div className="text-xs font-semibold text-[#334155]">
                    {currentServingToken.student_name} • ID: {currentServingToken.tuf_id}
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Status: <strong className="uppercase">{currentServingToken.status}</strong>
                  </div>
                </div>

                {/* Counter Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSetStatus(currentServingToken.id, "completed")}
                    className="py-2.5 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
                  >
                    Complete Service
                  </button>

                  <button
                    onClick={() => handleSetStatus(currentServingToken.id, "skipped")}
                    className="py-2.5 px-3 rounded bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition"
                  >
                    Skip / No-Show
                  </button>

                  {currentServingToken.application_id ? (
                    <Link
                      href={`/staff/requests/${currentServingToken.application_id}`}
                      className="py-2.5 px-3 rounded border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#0f172a] font-bold text-xs text-center transition flex items-center justify-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Review Form</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSetStatus(currentServingToken.id, "serving")}
                      className="py-2.5 px-3 rounded border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#0f172a] font-bold text-xs transition"
                    >
                      Mark In-Service
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-[#cbd5e1] rounded-lg text-[#64748b] space-y-2">
                <Clock className="w-8 h-8 text-[#94a3b8] mx-auto" />
                <div className="text-xs font-bold text-[#0f172a]">No token currently assigned to this counter</div>
                <p className="text-[11px]">Click &quot;Call Next Token&quot; below to summon the next student in line.</p>
              </div>
            )}
          </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3">
                Desk Operations
              </h3>

              <button
                disabled={actionLoading}
                onClick={handleCallNext}
                className="w-full py-4 px-4 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-extrabold text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Call Next Token</span>
              </button>

              <div className="pt-2 border-t border-[#e2e8f0] space-y-2">
                <div className="text-xs font-bold text-[#0f172a]">Service Controls</div>
                {data?.services?.map((svc: any) => (
                  <div
                    key={svc.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-[#f8fafc] border border-[#e2e8f0]"
                  >
                    <span className="font-medium text-[#334155] truncate max-w-[140px]">{svc.name}</span>
                    <button
                      onClick={() => handleTogglePause(svc.id, svc.status)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                        svc.status === "paused"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {svc.status === "paused" ? "Resume" : "Pause"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* Live Waiting Queue Table */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e2e8f0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Waiting Students Queue ({waitingList.length})</h3>
              <p className="text-[11px] text-[#64748b]">Real-time queue sequence for today&apos;s administrative window</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by token or student..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#475569] font-bold">
                  <th className="p-2.5">Token</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">TUF ID</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Issued At</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#64748b] text-xs">
                      No waiting tokens currently in line.
                    </td>
                  </tr>
                ) : (
                  waitingList.map((t: any) => (
                    <tr key={t.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                      <td className="p-2.5 font-mono font-bold text-[#1d4ed8]">{t.label}</td>
                      <td className="p-2.5 font-semibold text-[#0f172a]">{t.student_name}</td>
                      <td className="p-2.5 font-mono text-[#64748b]">{t.tuf_id}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#64748b]">
                        {new Date(t.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-2.5 text-right">
                        {t.application_id && (
                          <Link
                            href={`/staff/requests/${t.application_id}`}
                            className="text-[11px] font-bold text-[#1d4ed8] hover:underline"
                          >
                            Review
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
