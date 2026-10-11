"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  Database,
  Calendar,
  FileText,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";

interface StudentRecord {
  id: string;
  tuf_id: string;
  full_name: string;
  class_year: string;
  branch: string;
  division?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  request_count: number;
  latest_request?: {
    id: string;
    service_name: string;
    status: string;
    created_at: string;
    reference_number?: string | null;
  } | null;
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function loadStudents(query = "") {
    setLoading(true);
    const url = query ? `/api/admin/students?q=${encodeURIComponent(query)}` : "/api/admin/students";
    fetch(url)
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/staff/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.students) {
          setStudents(data.students);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadStudents(search);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-16">
      <InstitutionalHeader subtitle="STUDENT REGISTRATION & APPLICATION DIRECTORY" showStaffLink={false} />

      {/* Sub-header Navigation */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/staff"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Staff Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/data"
              className="text-xs font-semibold px-3 py-1.5 rounded border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#0f172a] flex items-center space-x-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Full Data Viewer</span>
            </Link>
            <button
              onClick={() => loadStudents(search)}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Header & Search */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0f172a] flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#1d4ed8]" />
                <span>Enrolled Students Registry</span>
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Directory of student identities verified via application submissions. Linked to all tokens and requests.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by TUF ID, Name, Branch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#cbd5e1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] w-64"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold bg-[#1d4ed8] text-white rounded-md hover:bg-[#1e40af]"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748b]">
              <div className="w-6 h-6 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading student directory records...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748b]">
              No student records found {search ? `matching "${search}"` : ""}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">TUF ID</th>
                    <th className="py-2.5 px-4">Student Name</th>
                    <th className="py-2.5 px-4">Class & Branch</th>
                    <th className="py-2.5 px-4">Division</th>
                    <th className="py-2.5 px-4">Requests</th>
                    <th className="py-2.5 px-4">Latest Application</th>
                    <th className="py-2.5 px-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#f8fafc] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#1d4ed8]">
                        {student.tuf_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0f172a]">
                        {student.full_name}
                      </td>
                      <td className="py-3 px-4 text-[#334155]">
                        <span className="font-semibold">{student.class_year}</span> - {student.branch}
                      </td>
                      <td className="py-3 px-4 text-[#64748b]">
                        {student.division || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                          {student.request_count} {student.request_count === 1 ? "application" : "applications"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.latest_request ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-[#0f172a]">
                              {student.latest_request.service_name}
                            </div>
                            <div className="text-[10px] text-[#64748b] flex items-center space-x-1">
                              <span className="uppercase font-mono bg-slate-100 px-1 py-0.2 rounded">
                                {student.latest_request.status}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(student.latest_request.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#94a3b8] italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#64748b] text-[11px]">
                        {new Date(student.updated_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
