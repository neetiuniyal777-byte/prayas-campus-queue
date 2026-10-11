"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SERVICES_CONFIG } from "@/lib/templates";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileCheck, 
  Loader2, 
  Upload, 
  Download,
  AlertCircle,
  FileText
} from "lucide-react";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.slug as string;
  const service = SERVICES_CONFIG[serviceSlug];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [details, setDetails] = useState({
    fullName: "",
    classYear: "FE",
    branch: "Computer Engineering",
    tufId: "",
    division: "",
    academicYear: "2026-27",
  });

  const [extraFields, setExtraFields] = useState<Record<string, any>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (service) {
      const initial: Record<string, any> = {};
      service.extraFields.forEach((f) => {
        if (f.type === "dropdown" && f.options?.length) {
          initial[f.key] = f.options[0];
        } else if (f.type === "number") {
          initial[f.key] = 1;
        } else {
          initial[f.key] = "";
        }
      });
      setExtraFields(initial);
    }
  }, [service]);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-[#64748b]">Service not found.</p>
          <Link href="/" className="text-[#1d4ed8] font-bold text-xs underline mt-2 block">
            Return to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!details.fullName || details.fullName.trim().length < 3) {
      errs.fullName = "Please enter full student name (minimum 3 characters)";
    }
    if (!details.tufId || details.tufId.trim().length === 0) {
      errs.tufId = "TUF Student ID is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    service.extraFields.forEach((f) => {
      if (f.required && !extraFields[f.key]) {
        errs[f.key] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function loadPdfPreview() {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/forms/${service.slug}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentDetails: details,
          extraFields,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
        const url = URL.createObjectURL(blob);
        setPreviewPdfUrl(url);
      }
    } catch (e) {
      console.error("Preview load error:", e);
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleNext() {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      setStep(4);
      loadPdfPreview();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          fullName: details.fullName,
          classYear: details.classYear,
          branch: details.branch,
          tufId: details.tufId,
          division: details.division,
          academicYear: details.academicYear,
          extraFields,
        }),
      });

      const data = await res.json();
      if (res.ok && data.trackingUrl) {
        router.push(data.trackingUrl);
      } else {
        alert(data.error || "Failed to issue token. Please check your inputs.");
      }
    } catch {
      alert("Network connectivity issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href={`/service/${service.slug}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
          <span className="text-xs font-bold text-[#0f172a] truncate max-w-xs">{service.name}</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a]">
            Step {step} of 4
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* 4-Step Linear Indicator (Institutional Flat Design) */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, title: "1. Details" },
            { num: 2, title: "2. Form" },
            { num: 3, title: "3. Upload" },
            { num: 4, title: "4. Review" },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2 rounded border text-center transition ${
                step === s.num
                  ? "bg-[#1d4ed8] text-white border-[#1d4ed8]"
                  : step > s.num
                  ? "bg-white text-emerald-700 border-emerald-300 font-bold"
                  : "bg-white text-[#94a3b8] border-[#e2e8f0]"
              }`}
            >
              <div className="text-[11px] font-bold truncate">
                {step > s.num ? `✓ ${s.title}` : s.title}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1: Applicant Details */}
        {step === 1 && (
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2e8f0] pb-3">
              <h2 className="text-base font-bold text-[#0f172a]">Step 1: Student Particulars</h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Information entered here will be mapped to the official college format application PDF.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Full Student Name (as per University ID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patil Rohan Ramesh"
                  value={details.fullName}
                  onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
                {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  TUF Student Identification Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TUF20240982"
                  value={details.tufId}
                  onChange={(e) => setDetails({ ...details, tufId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
                {errors.tufId && <p className="text-[11px] text-red-600 mt-1">{errors.tufId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Class / Year *</label>
                  <select
                    value={details.classYear}
                    onChange={(e) => setDetails({ ...details, classYear: e.target.value })}
                    className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Academic Year *</label>
                  <select
                    value={details.academicYear}
                    onChange={(e) => setDetails({ ...details, academicYear: e.target.value })}
                    className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                  >
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Branch / Engineering Department *</label>
                <select
                  value={details.branch}
                  onChange={(e) => setDetails({ ...details, branch: e.target.value })}
                  className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Electrical">Electrical Engineering</option>
                  <option value="E&TC">Electronics & Telecomm (E&TC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Division & Roll Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Div A, Roll No. 42"
                  value={details.division}
                  onChange={(e) => setDetails({ ...details, division: e.target.value })}
                  className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Service Form Fields */}
        {step === 2 && (
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2e8f0] pb-3">
              <h2 className="text-base font-bold text-[#0f172a]">Step 2: Service Specific Requirements</h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Specific fields for {service.name}.
              </p>
            </div>

            <div className="space-y-4">
              {service.extraFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    {field.label} {field.required && "*"}
                  </label>

                  {field.type === "dropdown" ? (
                    <select
                      value={extraFields[field.key] || ""}
                      onChange={(e) => setExtraFields({ ...extraFields, [field.key]: e.target.value })}
                      className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={extraFields[field.key] || ""}
                      onChange={(e) => setExtraFields({ ...extraFields, [field.key]: e.target.value })}
                      className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      min={field.type === "number" ? 1 : undefined}
                      value={extraFields[field.key] || ""}
                      onChange={(e) =>
                        setExtraFields({
                          ...extraFields,
                          [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="w-full text-xs p-2.5 rounded border border-[#cbd5e1] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                    />
                  )}

                  {errors[field.key] && (
                    <p className="text-[11px] text-red-600 mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Document Upload */}
        {step === 3 && (
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b border-[#e2e8f0] pb-3">
              <h2 className="text-base font-bold text-[#0f172a]">Step 3: Supporting Document Attachment</h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Attach student identity card or fee receipt (PDF, JPG, PNG, max 5 MB).
              </p>
            </div>

            <div className="border-2 border-dashed border-[#cbd5e1] rounded-lg p-8 text-center space-y-3 bg-[#f8fafc]">
              <Upload className="w-8 h-8 text-[#64748b] mx-auto" />
              <div className="text-xs font-semibold text-[#0f172a]">
                {uploadName ? `Attached: ${uploadName}` : "Select supporting document to upload"}
              </div>
              <p className="text-[11px] text-[#64748b]">
                Maximum file size: 5 MB. Allowed formats: PDF, JPEG, PNG.
              </p>
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size exceeds 5 MB limit.");
                      return;
                    }
                    setUploadedFile(file);
                    setUploadName(file.name);
                  }
                }}
              />
              <label
                htmlFor="doc-upload"
                className="inline-block text-xs font-semibold px-4 py-2 rounded bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer text-[#0f172a] transition"
              >
                Browse File
              </label>
            </div>

            <div className="text-[11px] text-[#64748b] bg-[#f1f5f9] p-3 rounded border border-[#e2e8f0]">
              <strong>Note:</strong> Upload is optional for token generation. You can always present physical originals at Counter 1 during your turn.
            </div>
          </div>
        )}

        {/* STEP 4: Live PDF Preview & Submission */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#0f172a]">Step 4: Live Form Review & Confirmation</h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Review your auto-filled official college application PDF before generating your token.
                  </p>
                </div>
                {previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    download={`${service.slug}_application_form.pdf`}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#0f172a] flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              {/* Preview Container */}
              <div className="border border-[#e2e8f0] rounded bg-[#f8fafc] h-96 relative flex items-center justify-center overflow-hidden">
                {previewLoading ? (
                  <div className="flex flex-col items-center space-y-2 text-[#64748b]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1d4ed8]" />
                    <span className="text-xs font-medium">Generating official PDF preview...</span>
                  </div>
                ) : previewPdfUrl ? (
                  <iframe
                    src={previewPdfUrl}
                    title="Live Filled Application PDF Preview"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="text-xs text-[#94a3b8]">Preview unavailable</div>
                )}
              </div>

              {/* Summary Details */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-3 text-xs grid grid-cols-2 gap-2 text-[#334155]">
                <div><strong>Student:</strong> {details.fullName}</div>
                <div><strong>TUF ID:</strong> {details.tufId}</div>
                <div><strong>Class / Branch:</strong> {details.classYear} - {details.branch}</div>
                <div><strong>Academic Year:</strong> {details.academicYear}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded border border-[#cbd5e1] bg-white font-semibold text-xs text-[#475569] hover:bg-[#f1f5f9] transition"
            >
              Previous Step
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] font-bold text-xs text-white transition shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 font-bold text-xs text-white transition shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Allocating Token...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit & Issue Queue Token</span>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
