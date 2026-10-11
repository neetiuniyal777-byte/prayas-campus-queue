"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Clock, 
  ArrowRight, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  FileText,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { COLLEGE_CONFIG } from "@/config/college";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  prefix: string;
  status: string;
  default_duration_min: number;
  waiting_count: number;
  current_token?: string | null;
  current_counter?: string | null;
}

export default function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-12">
      <InstitutionalHeader />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Institutional Notice Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e2e8f0] pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#1d4ed8]">
                <span>Student Services Portal</span>
                <span>•</span>
                <span>Academic Year 2026-27</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-1">
                Digital Token & Form Generation System
              </h2>
            </div>
            <div className="flex items-center space-x-3 text-xs bg-[#f1f5f9] px-3 py-2 rounded-md border border-[#e2e8f0]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#0f172a]">Counters Active</span>
              <span className="text-[#64748b]">|</span>
              <span className="text-[#64748b]">Operating Hours: 09:30 AM - 04:30 PM</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#475569] mt-3 leading-relaxed">
            Select an administrative service below to generate your pre-filled official application PDF, review it instantly, and secure your digital queue token. Bring your original identity card when your token is announced.
          </p>
        </div>

        {/* Services Section Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <h3 className="text-base font-bold text-[#0f172a]">Available Administrative Services</h3>
            <p className="text-xs text-[#64748b]">Select a service to start your digital application or download blank templates</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#cbd5e1] bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>
        </div>

        {/* Services Grid (Information Dense, 1px Border, Moderate Radius) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white border border-[#e2e8f0] rounded-lg p-5 animate-pulse space-y-3" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-10 text-center text-xs text-[#64748b]">
            No administrative services matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => {
              const isPaused = service.status === "paused";
              return (
                <div
                  key={service.slug}
                  className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm hover:border-[#94a3b8] transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a]">
                        Code: {service.prefix}
                      </span>
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isPaused
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isPaused ? "Paused" : "Open for Requests"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0f172a] leading-snug">
                      {service.name}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded">
                        <div className="text-[10px] uppercase font-semibold text-[#64748b]">Avg Time</div>
                        <div className="font-bold text-[#0f172a] mt-0.5">~{service.default_duration_min} mins</div>
                      </div>
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded">
                        <div className="text-[10px] uppercase font-semibold text-[#64748b]">In Queue</div>
                        <div className="font-bold text-[#1d4ed8] mt-0.5">{service.waiting_count} waiting</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                    <Link
                      href={`/service/${service.slug}`}
                      className="text-xs font-semibold text-[#475569] hover:text-[#0f172a] px-2.5 py-1.5 rounded hover:bg-[#f1f5f9] transition"
                    >
                      Requirements
                    </Link>
                    <Link
                      href={`/service/${service.slug}/apply`}
                      className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded text-white transition ${
                        isPaused
                          ? "bg-[#94a3b8] pointer-events-none"
                          : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                      }`}
                    >
                      <span>Start Application</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Verification & Security Footer Banner */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
            <span>Official University Record Verification • Atomic Token Allocation • Zero Data Leaks</span>
          </div>
          <Link
            href="/verify/sample"
            className="font-semibold text-[#1d4ed8] hover:underline flex items-center space-x-1"
          >
            <span>Verify Issued Certificate Authenticity</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </main>
    </div>
  );
}
