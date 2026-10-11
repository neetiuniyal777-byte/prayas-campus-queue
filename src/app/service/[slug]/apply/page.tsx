"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SERVICES_CONFIG, COMMON_STUDENT_FIELDS, ServiceDef } from "@/lib/templates";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Eye, 
  FileCheck, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Download
} from "lucide-react";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const serviceSlug = params.slug as string;
  const service = SERVICES_CONFIG[serviceSlug];

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Student Details State
  const [details, setDetails] = useState({
    fullName: "",
    classYear: "FE",
    branch: "Computer Engineering",
    tufId: "",
    division: "",
    academicYear: "2026-27",
  });

  // Extra service fields
  const [extraFields, setExtraFields] = useState<Record<string, any>>({});

  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Initialize extra fields defaults
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">Service not found.</p>
          <Link href="/" className="text-blue-600 font-bold text-xs underline mt-2 block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Validate Step 1
  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!details.fullName || details.fullName.trim().length < 3) {
      errs.fullName = "Please enter your full name (minimum 3 characters)";
    }
    if (!details.tufId || details.tufId.trim().length === 0) {
      errs.tufId = "TUF ID is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Validate Step 2
  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    service.extraFields.forEach((field) => {
      if (field.required && !extraFields[field.key]) {
        errs[field.key] = `${field.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Fetch Live PDF Preview
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
      console.error("Preview error:", e);
    } finally {
      setPreviewLoading(false);
    }
  }

  // Handle Step Advancement
  function handleNext() {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        loadPdfPreview();
      }
    }
  }

  // Handle Final Submission
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
        alert(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/service/${service.slug}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-bold text-slate-800">{service.name}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
            Step {step} of 3
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, title: "Student Details" },
            { num: 2, title: "Service Fields" },
            { num: 3, title: "Preview & Submit" },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border text-center transition ${
                step === s.num
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : step > s.num
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">
                {step > s.num ? "✓ Done" : `Step ${s.num}`}
              </div>
              <div className="text-xs font-bold truncate mt-0.5">{s.title}</div>
            </div>
          ))}
        </div>

        {/* STEP 1: Student Profile */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your details once. They will automatically fill into the official college form.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (as per College ID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohan Rahul Patil"
                  value={details.fullName}
                  onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* TUF ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TUF Student ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TUF20240982"
                  value={details.tufId}
                  onChange={(e) => setDetails({ ...details, tufId: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.tufId && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.tufId}</p>
                )}
              </div>

              {/* Class & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Year *
                  </label>
                  <select
                    value={details.classYear}
                    onChange={(e) => setDetails({ ...details, classYear: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    value={details.academicYear}
                    onChange={(e) => setDetails({ ...details, academicYear: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Branch / Department *
                </label>
                <select
                  value={details.branch}
                  onChange={(e) => setDetails({ ...details, branch: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Electrical">Electrical Engineering</option>
                  <option value="E&TC">Electronics & Telecomm (E&TC)</option>
                </select>
              </div>

              {/* Division / Roll */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Division & Roll No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Div A, Roll 42"
                  value={details.division}
                  onChange={(e) => setDetails({ ...details, division: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Service Specific Requirements */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{service.name} Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide the specific details required for this certificate.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {service.extraFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label} {field.required && "*"}
                  </label>

                  {field.type === "dropdown" ? (
                    <select
                      value={extraFields[field.key] || ""}
                      onChange={(e) =>
                        setExtraFields({ ...extraFields, [field.key]: e.target.value })
                      }
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onChange={(e) =>
                        setExtraFields({ ...extraFields, [field.key]: e.target.value })
                      }
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      min={field.type === "number" ? 1 : undefined}
                      value={extraFields[field.key] || ""}
                      onChange={(e) =>
                        setExtraFields({
                          ...extraFields,
                          [field.key]:
                            field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {errors[field.key] && (
                    <p className="text-[11px] text-red-500 mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Live Form Preview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify your generated college form before confirming submission.
                  </p>
                </div>
                {previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    download={`${service.slug}_application_form.pdf`}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PDF</span>
                  </a>
                )}
              </div>

              {/* Preview Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-96 relative flex items-center justify-center">
                {previewLoading ? (
                  <div className="flex flex-col items-center space-y-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Generating form preview...</span>
                  </div>
                ) : previewPdfUrl ? (
                  <iframe
                    src={previewPdfUrl}
                    title="Filled Application Preview"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="text-xs text-slate-400">PDF Preview Unavailable</div>
                )}
              </div>

              {/* Student Summary Card */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-100">
                <div className="font-bold text-slate-800">Application Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Student:</strong> {details.fullName}</div>
                  <div><strong>TUF ID:</strong> {details.tufId}</div>
                  <div><strong>Class:</strong> {details.classYear} - {details.branch}</div>
                  <div><strong>Academic Year:</strong> {details.academicYear}</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2 text-xs text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Clicking <strong>Submit & Get Token</strong> will register your queue position and link this generated application.
                </span>
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
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-md shadow-blue-200 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-md shadow-emerald-200 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Token...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit & Get Live Token</span>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
