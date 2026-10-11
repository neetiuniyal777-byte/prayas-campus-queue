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
  ChevronRight,
  QrCode,
  Layers,
  Ticket,
  Users,
  MapPin,
  Phone,
  Mail
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

  const totalWaiting = services.reduce((acc, s) => acc + (s.waiting_count || 0), 0);
  const activeServingTokens = services.map((s) => s.current_token).filter(Boolean);
  const nowServingDisplay = activeServingTokens.length > 0 ? activeServingTokens[0] : "—";
  const avgWaitTime = services.length > 0 
    ? Math.round(services.reduce((acc, s) => acc + s.default_duration_min, 0) / services.length) 
    : 5;

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col justify-between">
      <div>
        <InstitutionalHeader />

        {/* 1. Solid-Colour Band with Live Numbers */}
        <section className="bg-[#0f172a] text-white border-b border-slate-800 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Administrative Queue System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                Get your digital token
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Scan the office QR code, select your required service, receive an auto-filled verified application form, and track your queue in real time.
              </p>
            </div>

            {/* Three Live Numbers */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="bg-[#1e293b] border border-slate-700/80 rounded-md p-3.5 sm:p-4 text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Now Serving
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#60a5fa] mt-1">
                  {nowServingDisplay}
                </div>
              </div>

              <div className="bg-[#1e293b] border border-slate-700/80 rounded-md p-3.5 sm:p-4 text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Waiting
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400 mt-1">
                  {totalWaiting}
                </div>
              </div>

              <div className="bg-[#1e293b] border border-slate-700/80 rounded-md p-3.5 sm:p-4 text-center">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Average Wait
                </div>
                <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                  ~{avgWaitTime}m
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Numbered 4-Step Strip */}
        <section className="bg-white border-b border-[#e2e8f0]">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {[
                { step: "1", title: "Scan QR Code", desc: "Open portal on your device" },
                { step: "2", title: "Select Service", desc: "Pick your administrative request" },
                { step: "3", title: "Get Live Token", desc: "Receive token & filled form" },
                { step: "4", title: "Track & Collect", desc: "Approach counter when called" },
              ].map((item) => (
                <div key={item.step} className="flex items-center space-x-3 p-2 rounded border border-[#f1f5f9] bg-[#f8fafc]">
                  <div className="w-7 h-7 rounded bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0f172a] truncate">{item.title}</div>
                    <div className="text-[10px] text-[#64748b] truncate">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Main Services Section */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e2e8f0] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a]">Administrative Services Directory</h3>
              <p className="text-xs text-[#64748b]">Select a service below to generate application forms and enter the active queue</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#cbd5e1] bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
              />
            </div>
          </div>

          {/* Service Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-white border border-[#e2e8f0] rounded-md p-5 animate-pulse space-y-3" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-md p-10 text-center text-xs text-[#64748b]">
              No administrative services found matching your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((service) => {
                const isPaused = service.status === "paused";
                return (
                  <div
                    key={service.slug}
                    className="bg-white border border-[#e2e8f0] rounded-md p-5 shadow-sm hover:border-[#94a3b8] transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a]">
                          Code: {service.prefix}
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                            isPaused
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <span>{isPaused ? "Paused" : "Open"}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0f172a] leading-snug">
                        {service.name}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded">
                          <div className="text-[10px] uppercase font-bold text-[#64748b]">Est. Time</div>
                          <div className="font-bold text-[#0f172a] mt-0.5">~{service.default_duration_min} mins</div>
                        </div>
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded">
                          <div className="text-[10px] uppercase font-bold text-[#64748b]">Queue Load</div>
                          <div className="font-bold text-[#1d4ed8] mt-0.5">{service.waiting_count} waiting</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                      <Link
                        href={`/service/${service.slug}`}
                        className="text-xs font-semibold text-[#475569] hover:text-[#0f172a] px-2.5 py-1.5 rounded hover:bg-[#f1f5f9] transition"
                      >
                        Guidelines
                      </Link>
                      <Link
                        href={`/service/${service.slug}/apply`}
                        className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded text-white transition ${
                          isPaused
                            ? "bg-[#94a3b8] pointer-events-none"
                            : "bg-[#1d4ed8] hover:bg-[#1e40af]"
                        }`}
                      >
                        <span>Apply & Get Token</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Security & Verification Banner */}
          <div className="bg-white border border-[#e2e8f0] rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#1d4ed8] flex-shrink-0" />
              <span>Official Institutional Document Issuance • Tamper-evident QR Verification</span>
            </div>
            <Link
              href="/verify/sample"
              className="font-semibold text-[#1d4ed8] hover:underline flex items-center space-x-1 flex-shrink-0"
            >
              <span>Verify Issued Document</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </main>
      </div>

      {/* 4. Institutional Footer */}
      <footer className="bg-[#0f172a] text-slate-400 text-xs border-t border-slate-800 mt-12 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white uppercase tracking-wider">{COLLEGE_CONFIG.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{COLLEGE_CONFIG.affiliation}</div>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-mono">
            <div>Office of Student Records & Certificates</div>
            <div>Institutional Digital Token System • Academic Year 2026-27</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
