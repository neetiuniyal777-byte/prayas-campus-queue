import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES_CONFIG } from "@/lib/templates";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { COLLEGE_CONFIG } from "@/config/college";
import { 
  ArrowLeft, 
  Download, 
  ArrowRight, 
  FileCheck2, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Building,
  FileText
} from "lucide-react";

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = SERVICES_CONFIG[params.slug];

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader />

      {/* Sub Header Navigation */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </Link>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a]">
            Prefix: {service.prefix}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Service Details Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-[#e2e8f0] pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
              Academic Office Service Specification
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-1">
              {service.name}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            {service.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] text-xs">
              <div className="text-[#64748b] font-medium">Estimated Processing Window</div>
              <div className="font-bold text-[#0f172a] text-sm mt-0.5">~{service.durationMin} Minutes per Student</div>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] text-xs">
              <div className="text-[#64748b] font-medium">Designated Counters</div>
              <div className="font-bold text-[#0f172a] text-sm mt-0.5">Counter 1 & 2 (General & Student Affairs)</div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#0f172a] flex items-center space-x-2 border-b border-[#e2e8f0] pb-3">
            <CheckCircle className="w-4 h-4 text-[#1d4ed8]" />
            <span>Required Documents for Counter Verification</span>
          </h2>

          <div className="space-y-2.5 text-xs text-[#334155]">
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] mt-1.5 flex-shrink-0" />
              <span>Original College Identity Card (showing valid TUF ID and current academic year).</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] mt-1.5 flex-shrink-0" />
              <span>Fee payment receipt for current semester (for accounts or fee structure certificates).</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] mt-1.5 flex-shrink-0" />
              <span>Previous semester marksheet or admit card (for examination correction or duplicate marksheet).</span>
            </div>
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-xs text-[#475569]">
            <strong>Official Policy:</strong> Students may fill this application directly on their mobile device to get an auto-generated PDF and queue token, or download the official blank form below to complete manually.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/service/${service.slug}/apply`}
            className="flex-1 flex items-center justify-center space-x-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold py-3 px-4 rounded text-xs transition shadow-sm"
          >
            <span>Proceed to Digital Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`/api/forms/${service.slug}/blank`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-white hover:bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] font-semibold py-3 px-4 rounded transition text-xs"
          >
            <Download className="w-4 h-4 text-[#64748b]" />
            <span>Download Official Blank Form (PDF)</span>
          </a>
        </div>
      </main>
    </div>
  );
}
