"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Monitor, RefreshCw } from "lucide-react";

interface DisplayService {
  id: string;
  name: string;
  prefix: string;
  current_token?: string | null;
  current_counter?: string | null;
  waiting_count: number;
}

export default function PublicDisplayPage() {
  const [services, setServices] = useState<DisplayService[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  function loadState() {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    updateClock();
    const tInterval = setInterval(updateClock, 1000);
    return () => clearInterval(tInterval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Kiosk Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20">
            PQ
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              CAMPUS ADMINISTRATIVE OFFICE
            </h1>
            <p className="text-sm text-slate-400">LIVE QUEUE & SERVICE TOKEN DISPLAY</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-blue-400">
              {currentTime}
            </div>
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Boards Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 flex-1">
        {services.map((service) => (
          <div
            key={service.prefix}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800/50">
                  Service {service.prefix}
                </span>
                <span className="text-xs text-slate-400">
                  Waiting: <strong className="text-white">{service.waiting_count}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white truncate">
                {service.name}
              </h2>
            </div>

            {/* Now Serving Big Display */}
            <div className="py-6 text-center">
              <div className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-1">
                Now Serving
              </div>
              <div className="text-6xl sm:text-7xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {service.current_token || `${service.prefix}-001`}
              </div>
            </div>

            {/* Counter Label */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Counter:</span>
              <span className="font-bold text-blue-300">
                {service.current_counter || "Counter 1"}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* Ticker Footer */}
      <footer className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Notice: Please keep your original documents ready when your token is called.</span>
        </div>
        <Link href="/" className="hover:text-slate-200 underline text-[11px]">
          Student Portal
        </Link>
      </footer>
    </div>
  );
}
