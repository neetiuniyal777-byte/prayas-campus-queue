"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { COLLEGE_CONFIG } from "@/config/college";

interface DisplayService {
  id: string;
  name: string;
  prefix: string;
  current_token?: string | null;
  current_counter?: string | null;
  waiting_count: number;
  next_labels?: string[];
}

export default function PublicDisplayPage() {
  const [services, setServices] = useState<DisplayService[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  function loadQueueState() {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});
  }

  // Supabase Realtime subscription with 8-second polling fallback
  useEffect(() => {
    loadQueueState();

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { createClient } = require("@/lib/supabase/client");
        const supabase = createClient();
        channel = supabase
          .channel("display_queue_realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "public_queue_state" },
            () => {
              loadQueueState();
            }
          )
          .subscribe();
      }
    } catch {
      // Fallback cleanly to polling if Realtime connection fails
    }

    // 8-second polling fallback
    const interval = setInterval(loadQueueState, 8000);

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          const { createClient } = require("@/lib/supabase/client");
          createClient().removeChannel(channel);
        } catch {}
      }
    };
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
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Kiosk Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-5">
          <div className="relative w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.png"
              alt={COLLEGE_CONFIG.name}
              width={54}
              height={54}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
              {COLLEGE_CONFIG.name}
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              {COLLEGE_CONFIG.officeName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-mono font-extrabold text-[#60a5fa] tracking-wider">
            {currentTime}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Main Boards Grid (Matching Reference Diagram Section 6) */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 flex-1">
        {services.map((service) => (
          <div
            key={service.prefix}
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#93c5fd] px-2.5 py-1 rounded bg-[#1e293b] border border-slate-700">
                  Service {service.prefix}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Waiting: <strong className="text-white font-mono">{service.waiting_count}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white truncate">
                {service.name}
              </h2>
            </div>

            {/* Oversized Now Serving Token (Legible from 10m) */}
            <div className="py-6 text-center bg-[#090d16] border border-slate-800 rounded-lg my-3">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Now Serving
              </div>
              <div className="text-6xl sm:text-7xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {service.current_token || `${service.prefix}-001`}
              </div>
            </div>

            {/* Next 3 Upcoming Tokens Strip */}
            <div className="mb-3 px-3 py-2 rounded bg-[#090d16] border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400">Next In Line:</span>
              <div className="flex items-center space-x-1.5 font-mono">
                {service.next_labels && service.next_labels.length > 0 ? (
                  service.next_labels.slice(0, 3).map((lbl, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1e293b] text-amber-300 border border-slate-700"
                    >
                      {lbl}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500 font-sans italic">None waiting</span>
                )}
              </div>
            </div>

            {/* Counter Assignment Block */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Assigned Window:</span>
              <span className="font-bold text-[#60a5fa] font-mono text-sm">
                {service.current_counter || "Counter 1"}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* Announcements Ticker (Section 6) */}
      <footer className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Attention Students: Please present your original College Identity Card and fee receipts at the designated counter.
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          System Operational • Zero Data Exposure
        </div>
      </footer>
    </div>
  );
}
