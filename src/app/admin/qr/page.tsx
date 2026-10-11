"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { COLLEGE_CONFIG } from "@/config/college";

export default function QrPosterPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [appUrl, setAppUrl] = useState<string>("");

  useEffect(() => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setAppUrl(currentOrigin);
    QRCode.toDataURL(currentOrigin, { width: 380, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-4 sm:p-8">
      {/* Action Header (Hidden on print) */}
      <div className="max-w-2xl mx-auto flex items-center justify-between pb-6 print:hidden">
        <Link
          href="/admin/data"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Panel</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Poster</span>
        </button>
      </div>

      {/* Printable Poster Sheet (A4 Proportion) */}
      <div className="max-w-2xl mx-auto bg-white border-2 border-[#0f172a] rounded-lg p-10 text-center space-y-6 shadow-md print:shadow-none print:border-2 print:border-black">
        {/* Institutional Header */}
        <div className="space-y-3 border-b-2 border-[#0f172a] pb-6">
          <div className="relative w-24 h-24 mx-auto border border-[#e2e8f0] rounded-lg p-2 bg-white flex items-center justify-center">
            <Image
              src="/logo.png"
              alt={COLLEGE_CONFIG.name}
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] uppercase tracking-tight">
              {COLLEGE_CONFIG.name}
            </h1>
            <p className="text-xs text-[#475569] font-medium mt-1">
              {COLLEGE_CONFIG.affiliation}
            </p>
            <p className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider mt-1">
              {COLLEGE_CONFIG.officeName}
            </p>
          </div>
        </div>

        {/* Poster Call to Action */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] uppercase tracking-tight">
            SCAN FOR DIGITAL TOKEN & FORMS
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
            Scan using any mobile camera or QR code scanner to submit your application and track your queue position live.
          </p>
        </div>

        {/* High-Resolution QR Code */}
        <div className="p-4 border-2 border-dashed border-[#0f172a] inline-block rounded-lg bg-white">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="Scan QR for Campus Queue"
              width={260}
              height={260}
              className="mx-auto"
            />
          ) : (
            <div className="w-64 h-64 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
              Generating QR...
            </div>
          )}
        </div>

        {/* Instructions Steps */}
        <div className="grid grid-cols-3 gap-3 text-left border-t border-[#e2e8f0] pt-6 text-xs">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded">
            <div className="font-bold text-[#1d4ed8]">Step 1: Scan & Select</div>
            <div className="text-[11px] text-[#64748b] mt-1">Select Bonafide, Fee Query, or Verification service.</div>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded">
            <div className="font-bold text-[#1d4ed8]">Step 2: Instant Form</div>
            <div className="text-[11px] text-[#64748b] mt-1">Enter details once to auto-generate official college PDF.</div>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded">
            <div className="font-bold text-[#1d4ed8]">Step 3: Live Token</div>
            <div className="text-[11px] text-[#64748b] mt-1">Receive live queue token and approach counter when called.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 text-[10px] text-[#64748b] font-mono border-t border-[#e2e8f0]">
          Official Portal URL: {appUrl} • Strictly Zero Hand-written Forms
        </div>
      </div>
    </div>
  );
}
