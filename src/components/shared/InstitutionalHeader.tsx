import Link from "next/link";
import Image from "next/image";
import { COLLEGE_CONFIG } from "@/config/college";

export function InstitutionalHeader({
  subtitle = "ADMINISTRATIVE OFFICE • STUDENT SERVICES DIVISION",
  showStaffLink = true,
}: {
  subtitle?: string;
  showStaffLink?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] shadow-sm">
      {/* 1. Thin Institutional Top Strip */}
      <div className="bg-[#0f172a] text-slate-300 text-[10px] sm:text-[11px] font-medium tracking-wider uppercase py-1 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="truncate">
            Affiliated to University of Mumbai | Approved by AICTE | NAAC Accredited
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
            <span>OFFICE HOURS: 09:30 AM - 05:00 PM</span>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Branding Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group min-w-0">
          <div className="relative w-11 h-11 flex-shrink-0 border border-[#cbd5e1] rounded-md p-1 bg-white flex items-center justify-center">
            <Image
              src="/logo.png"
              alt={COLLEGE_CONFIG.name}
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-[#0f172a] tracking-tight leading-none group-hover:text-[#1d4ed8] transition truncate">
              {COLLEGE_CONFIG.name}
            </h1>
            <p className="text-[11px] text-[#64748b] font-semibold tracking-wider uppercase mt-1 truncate">
              {subtitle}
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <Link
            href="/"
            className="hidden md:inline-flex text-xs font-semibold text-[#475569] hover:text-[#0f172a] px-2 py-1"
          >
            Services
          </Link>
          <Link
            href="/display"
            target="_blank"
            className="text-xs font-semibold px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] transition flex items-center space-x-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kiosk Display</span>
          </Link>
          {showStaffLink && (
            <Link
              href="/staff/login"
              className="text-xs font-bold px-3 py-1.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white transition shadow-sm"
            >
              Staff Portal
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
