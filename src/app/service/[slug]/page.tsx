import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES_CONFIG } from "@/lib/templates";
import { 
  ArrowLeft, 
  Download, 
  ArrowRight, 
  FileCheck2, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Building2
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Services</span>
          </Link>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            Prefix {service.prefix}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Service Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Official Campus Service
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                {service.name}
              </h1>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {service.description}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Service Time</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">~{service.durationMin} Minutes</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-slate-500 flex items-center space-x-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Issuing Location</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">Admin Office, Counter 1</div>
            </div>
          </div>
        </div>

        {/* Requirements & Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Documents Checklist to Carry</span>
          </h2>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span>Valid College Identity Card (showing student TUF ID and current year).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span>Previous semester marksheet copy (if applying for academic verification).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span>Latest fee clearance receipt (for accounts and fee certificate queries).</span>
            </li>
          </ul>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> You can either generate your filled application form digitally on your phone, or download the blank PDF below to fill out manually.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/service/${service.slug}/apply`}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-200 transition"
          >
            <span>Fill Online & Issue Digital Token</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`/api/forms/${service.slug}/blank`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 px-4 rounded-xl transition text-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Official Blank Form (PDF)</span>
          </a>
        </div>
      </main>
    </div>
  );
}
