"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Database, 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Layers, 
  ShieldCheck,
  FileText,
  Activity,
  QrCode
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";

export default function AdminDataViewerPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "tokens" | "applications" | "tokenEvents" | "auditLog">("tokens");
  const [search, setSearch] = useState("");

  function loadData() {
    setLoading(true);
    fetch("/api/admin/data")
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/staff/login");
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentRows = (data?.[activeTab] || []).filter((row: any) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader subtitle="SYSTEM DATA AUDIT & INSPECTION VIEWER" showStaffLink={false} />

      {/* Action Header */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Staff Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/qr"
              className="text-xs font-semibold px-3 py-1.5 rounded border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#0f172a] flex items-center space-x-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Poster Generator</span>
            </Link>
            <button
              onClick={loadData}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Tables</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center space-x-1 bg-[#f1f5f9] p-1 rounded-md border border-[#e2e8f0]">
            {[
              { id: "tokens", label: "Tokens" },
              { id: "applications", label: "Applications" },
              { id: "services", label: "Services" },
              { id: "tokenEvents", label: "Token Events" },
              { id: "auditLog", label: "Audit Log" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-white text-[#1d4ed8] shadow-sm"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#64748b]">
                Loading database records...
              </div>
            ) : currentRows.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#64748b]">
                No records found in this table.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold">
                    {Object.keys(currentRows[0]).slice(0, 7).map((col) => (
                      <th key={col} className="p-3 uppercase tracking-wider text-[10px]">
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc]">
                      {Object.keys(row).slice(0, 7).map((col) => (
                        <td key={col} className="p-3 text-[#334155] font-mono text-[11px] max-w-[200px] truncate">
                          {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
