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
    <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-11 h-11 flex-shrink-0 border border-[#e2e8f0] rounded-md p-1 bg-white flex items-center justify-center">
            <Image
              src="/logo.png"
              alt={COLLEGE_CONFIG.name}
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#0f172a] tracking-tight leading-none group-hover:text-[#1d4ed8] transition">
              {COLLEGE_CONFIG.name}
            </h1>
            <p className="text-[11px] text-[#64748b] font-medium leading-tight mt-1">
              {subtitle}
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            href="/display"
            target="_blank"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-md border border-[#cbd5e1] bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] transition flex items-center space-x-1"
          >
            <span>Live Display</span>
          </Link>
          {showStaffLink && (
            <Link
              href="/staff/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af] text-white transition"
            >
              Staff Portal
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
