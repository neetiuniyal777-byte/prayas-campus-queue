"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  Download, 
  Loader2,
  Building,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [issuedReference, setIssuedReference] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/staff/applications/${appId}/review`)
      .then((res) => {
        if (res.status === 401) {
          router.push("/staff/login");
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d?.application) {
          setData(d);
          if (d.application.reference_number) {
            setIssuedReference(d.application.reference_number);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appId]);

  async function handleReview(status: "approved" | "rejected" | "needs_correction") {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/applications/${appId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });
      const resData = await res.json();
      if (res.ok) {
        alert(`Application status updated to: ${status}`);
        setData({ ...data, application: { ...data.application, status } });
      } else {
        alert(resData.error || "Failed to update review status.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateCertificate() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/applications/${appId}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const resData = await res.json();
      if (res.ok) {
        setIssuedReference(resData.referenceNumber);
        alert(`Certificate issued with Reference Number: ${resData.referenceNumber}`);
      } else {
        alert(resData.error || "Failed to generate certificate.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const app = data?.application;
  const token = data?.token;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader subtitle="STUDENT APPLICATION SCRUTINY & SANCTION" showStaffLink={false} />

      {/* Top Action Bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3 text-xs">
            <span className="font-bold text-[#0f172a]">
              Status: <span className="uppercase text-[#1d4ed8]">{app?.status}</span>
            </span>
            {token && (
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0]">
                Token: {token.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Split View Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Application Form PDF View */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Auto-Filled Application PDF</h3>
                <p className="text-[11px] text-[#64748b]">Generated on server in official university format</p>
              </div>
              <a
                href={`/api/forms/${app?.services?.slug || "bonafide"}/preview`}
                target="_blank"
                className="text-xs font-semibold text-[#1d4ed8] hover:underline flex items-center space-x-1"
              >
                <span>Full Screen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="border border-[#e2e8f0] rounded bg-[#f8fafc] h-[550px] overflow-hidden flex items-center justify-center">
              <iframe
                src={`/api/forms/${app?.services?.slug || "bonafide"}/preview`}
                title="Application Form Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>

          {/* Right: Scrutiny Details, Actions & Certificate Generation */}
          <div className="space-y-6">
            {/* Applicant Particulars Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                Applicant Identification
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748b]">Student Name</div>
                  <div className="font-bold text-[#0f172a] mt-0.5">{app?.student_name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748b]">TUF Student ID</div>
                  <div className="font-mono font-bold text-[#0f172a] mt-0.5">{app?.tuf_id}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748b]">Class & Branch</div>
                  <div className="font-semibold text-[#334155] mt-0.5">{app?.class_year} - {app?.branch}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748b]">Academic Year</div>
                  <div className="font-semibold text-[#334155] mt-0.5">{app?.academic_year}</div>
                </div>
              </div>

              {/* Extra service payload */}
              {app?.data && Object.keys(app.data).length > 0 && (
                <div className="pt-3 border-t border-[#e2e8f0] space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-[#64748b]">Service Form Fields:</div>
                  <div className="bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0] space-y-1">
                    {Object.entries(app.data).map(([k, v]: any) => (
                      <div key={k} className="flex justify-between">
                        <span className="font-medium text-[#64748b] capitalize">{k.replace(/_/g, " ")}:</span>
                        <span className="font-bold text-[#0f172a]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrutiny & Approval Controls */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                Scrutiny Decision & Comments
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Scrutiny Remarks / Correction Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Identity verified. Approved for certificate issuance."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={submitting}
                  onClick={() => handleReview("approved")}
                  className="py-2.5 px-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition"
                >
                  Approve
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleReview("needs_correction")}
                  className="py-2.5 px-2 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                >
                  Correction
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleReview("rejected")}
                  className="py-2.5 px-2 rounded bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Certificate Issuance Section */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-2 flex items-center justify-between">
                <span>Issued Certificate Generation</span>
                <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
              </h3>

              <p className="text-xs text-[#64748b]">
                Generate the official Bonafide Certificate with unique atomic reference number and cryptographic QR verification code.
              </p>

              {issuedReference ? (
                <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Certificate Reference Number:</span>
                    <span className="font-mono font-extrabold text-emerald-800 text-sm">{issuedReference}</span>
                  </div>

                  <a
                    href={`/api/staff/applications/${appId}/issue?download=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Issued Certificate (PDF)</span>
                  </a>
                </div>
              ) : (
                <button
                  disabled={submitting || app?.status !== "approved"}
                  onClick={handleGenerateCertificate}
                  className="w-full py-3 px-4 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs transition flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Generate & Issue Certificate PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
