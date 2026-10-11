export interface FormFieldDef {
  key: string;
  label: string;
  type: "text" | "dropdown" | "number" | "textarea";
  required?: boolean;
  options?: string[];
  validation?: string;
}

export interface ServiceDef {
  slug: string;
  name: string;
  prefix: string;
  title: string;
  description: string;
  durationMin: number;
  templateIds?: string[];
  extraFields: FormFieldDef[];
}

export const COMMON_STUDENT_FIELDS: FormFieldDef[] = [
  {
    key: "full_name",
    label: "Full Name",
    type: "text",
    required: true,
    validation: "letters and spaces, 3-80 chars",
  },
  {
    key: "class_year",
    label: "Class / Year",
    type: "dropdown",
    options: ["FE", "SE", "TE", "BE"],
    required: true,
  },
  {
    key: "branch",
    label: "Branch / Discipline",
    type: "dropdown",
    options: [
      "Computer Engineering",
      "IT",
      "Mechanical",
      "Civil",
      "Electrical",
      "E&TC",
    ],
    required: true,
  },
  {
    key: "tuf_id",
    label: "TUF Student ID",
    type: "text",
    required: true,
    validation: "Alphanumeric ID",
  },
  {
    key: "division",
    label: "Division / Roll No.",
    type: "text",
    required: false,
  },
  {
    key: "academic_year",
    label: "Academic Year",
    type: "dropdown",
    options: ["2026-27"],
    required: true,
  },
];

export const SERVICES_CONFIG: Record<string, ServiceDef> = {
  bonafide: {
    slug: "bonafide",
    name: "Bonafide Certificate",
    prefix: "B",
    title: "APPLICATION FOR BONAFIDE CERTIFICATE",
    description: "Application for official Bonafide Certificate for scholarship, passport, bank, or visa.",
    durationMin: 5,
    extraFields: [
      {
        key: "purpose",
        label: "Purpose",
        type: "dropdown",
        options: ["Scholarship", "Passport", "Bank", "Other"],
        required: true,
      },
      {
        key: "copies",
        label: "Number of Copies",
        type: "number",
        required: true,
      },
    ],
  },
  fee_certificate: {
    slug: "fee_certificate",
    name: "Fee Certificate",
    prefix: "F",
    title: "APPLICATION FOR FEE CERTIFICATE",
    description: "Application for Fee Structure / Certificate of fees paid for bank loans & reimbursements.",
    durationMin: 5,
    extraFields: [
      {
        key: "fee_type",
        label: "Fee Type (Tuition / Exam / Other)",
        type: "text",
        required: true,
      },
      {
        key: "receipt_no",
        label: "Receipt Number",
        type: "text",
        required: true,
      },
      {
        key: "purpose",
        label: "Purpose",
        type: "text",
        required: true,
      },
    ],
  },
  fee_query: {
    slug: "fee_query",
    name: "Fee Query / Accounts",
    prefix: "Q",
    title: "FEE QUERY FORM",
    description: "Enquiry and resolution regarding tuition fee installments, receipts, and excess balance.",
    durationMin: 10,
    extraFields: [
      {
        key: "category",
        label: "Query Category",
        type: "text",
        required: true,
      },
      {
        key: "receipt_no",
        label: "Receipt Number (if any)",
        type: "text",
        required: false,
      },
      {
        key: "details",
        label: "Query Details",
        type: "textarea",
        required: true,
      },
    ],
  },
  exam_form_correction: {
    slug: "exam_form_correction",
    name: "Exam Form Correction",
    prefix: "E",
    title: "EXAMINATION FORM CORRECTION REQUEST",
    description: "Correction of subject names, seat number, or personal details on university exam submission.",
    durationMin: 8,
    extraFields: [
      {
        key: "session",
        label: "Exam Session (e.g. Winter 2026)",
        type: "text",
        required: true,
      },
      {
        key: "seat_no",
        label: "Seat Number",
        type: "text",
        required: true,
      },
      {
        key: "field",
        label: "Field to Correct",
        type: "text",
        required: true,
      },
      {
        key: "correct_value",
        label: "Correct Value Required",
        type: "text",
        required: true,
      },
    ],
  },
  document_verification: {
    slug: "document_verification",
    name: "Document Verification",
    prefix: "D",
    title: "DOCUMENT VERIFICATION REQUEST",
    description: "Attestation and verification of grade cards, leaving certificates, and transcripts.",
    durationMin: 7,
    extraFields: [
      {
        key: "doc_type",
        label: "Document Type",
        type: "text",
        required: true,
      },
      {
        key: "issuer",
        label: "Issuing Body / Board",
        type: "text",
        required: true,
      },
      {
        key: "count",
        label: "Number of Documents",
        type: "number",
        required: true,
      },
      {
        key: "purpose",
        label: "Purpose",
        type: "text",
        required: true,
      },
    ],
  },
  duplicate_marksheet: {
    slug: "duplicate_marksheet",
    name: "Duplicate Marksheet / Transcript",
    prefix: "M",
    title: "REQUEST FOR DUPLICATE MARKSHEET / TRANSCRIPT",
    description: "Application for duplicate semester grade cards or consolidated transcript.",
    durationMin: 10,
    extraFields: [
      {
        key: "semester",
        label: "Semester / Year",
        type: "text",
        required: true,
      },
      {
        key: "reason",
        label: "Reason (Lost / Damaged)",
        type: "text",
        required: true,
      },
      {
        key: "copies",
        label: "Number of Copies",
        type: "number",
        required: true,
      },
    ],
  },
};
