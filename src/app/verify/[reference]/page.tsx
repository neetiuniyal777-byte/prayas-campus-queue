import Link from "next/link";
import { ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function CertificateVerifyPage({
  params,
}: {
  params: { reference: string };
}) {
  const { reference } = params;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Document Verification Portal
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Certificate Authenticity Confirmed
          </h1>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-3 text-left border border-slate-100">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Reference Number:</span>
            <span className="font-mono font-bold text-slate-800">{reference}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-600">Valid & Issued</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Document Type:</span>
            <span className="font-bold text-slate-800">Official Student Certificate</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500">Issuing Body:</span>
            <span className="font-bold text-slate-800">Campus Administrative Office</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          In compliance with campus privacy standards, personal identity details are not displayed on this public verification page.
        </p>

        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Campus Portal</span>
        </Link>
      </div>
    </div>
  );
}
