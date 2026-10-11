"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Bell, 
  Search,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
              PQ
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Campus Queue
              </h1>
              <p className="text-xs text-slate-500">Student Services Token Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/display"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1"
            >
              <span>Public Display</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Office Status Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Office Counters Active</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Get Your Digital Token in Under 30 Seconds
            </h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Choose your service below, generate your pre-filled official application PDF, and receive your live queue token.
            </p>
          </div>
          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Building2 className="w-48 h-48 text-white" />
          </div>
        </div>

        {/* Live Announcement */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900 text-xs">
          <Bell className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Office Notice: </span>
            Counters 1, 2, and 3 are actively serving student applications. Tokens are valid for today only.
          </div>
        </div>

        {/* Services List Header & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Services</h3>
              <p className="text-xs text-slate-500">Select a service to start or download a blank form</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Service Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-white rounded-xl border border-slate-200 animate-pulse p-5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((service) => (
                <div
                  key={service.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">
                        Prefix: {service.prefix}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepting Requests</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {service.name}
                    </h4>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{service.default_duration_min} min avg</span>
                      </div>
                      <div className="flex items-center space-x-1 font-medium text-slate-700">
                        <span>Waiting:</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                          {service.waiting_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/service/${service.slug}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/service/${service.slug}/apply`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 transition"
                    >
                      <span>Apply & Get Token</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & Verification Note */}
        <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>End-to-end Row Level Security • Atomic Zero-Duplicate Tokens</span>
          </div>
          <Link href="/verify/sample" className="font-semibold text-blue-600 hover:underline">
            Verify Certificate
          </Link>
        </div>
      </main>
    </div>
  );
}
