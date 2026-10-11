import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { COLLEGE_CONFIG } from "@/config/college";

export interface ApplicationPdfOptions {
  serviceTitle: string;
  serviceSlug: string;
  isBlank?: boolean;
  studentDetails?: {
    fullName?: string;
    tufId?: string;
    classYear?: string;
    branch?: string;
    division?: string;
    academicYear?: string;
  };
  extraFields?: Record<string, string | number>;
  trackingLabel?: string;
}

/**
 * Sanitizes and escapes raw user text to prevent PDF rendering errors or broken layouts.
 */
function sanitizeText(input: any): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/[\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

/**
 * Generates an official college format application PDF on the server.
 * Uses Terna Autonomous Engineering College header, official logo, and institutional format.
 */
export async function generateApplicationPdf(options: ApplicationPdfOptions): Promise<Uint8Array> {
  const {
    serviceTitle,
    isBlank = false,
    studentDetails = {},
    extraFields = {},
    trackingLabel,
  } = options;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const black = rgb(0.06, 0.09, 0.16);
  const navy = rgb(0.06, 0.09, 0.16);
  const brandBlue = rgb(0.11, 0.31, 0.85);
  const grayBorder = rgb(0.8, 0.83, 0.88);
  const lightBg = rgb(0.96, 0.97, 0.98);
  const textMuted = rgb(0.35, 0.4, 0.48);

  // Outer 1px defined institutional border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderWidth: 1.2,
    borderColor: navy,
  });

  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 0.5,
    borderColor: grayBorder,
  });

  let currentY = height - 42;

  // Embed Logo if available
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.08); // proportional fit
      page.drawImage(logoImage, {
        x: 40,
        y: currentY - 55,
        width: 65,
        height: 55,
      });
    } catch {
      // Fallback gracefully
    }
  }

  // Header Typography
  page.drawText(COLLEGE_CONFIG.name, {
    x: 115,
    y: currentY - 14,
    size: 13,
    font: fontBold,
    color: navy,
  });

  page.drawText(COLLEGE_CONFIG.affiliation, {
    x: 115,
    y: currentY - 28,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText(COLLEGE_CONFIG.officeName, {
    x: 115,
    y: currentY - 42,
    size: 8,
    font: fontBold,
    color: brandBlue,
  });

  currentY -= 68;

  // 1px Solid Divider
  page.drawLine({
    start: { x: 28, y: currentY },
    end: { x: width - 28, y: currentY },
    thickness: 1,
    color: navy,
  });

  currentY -= 18;

  // Title Ribbon (Flat background, 1px border)
  page.drawRectangle({
    x: 35,
    y: currentY - 18,
    width: width - 70,
    height: 24,
    color: lightBg,
    borderColor: grayBorder,
    borderWidth: 1,
  });

  const titleUpper = sanitizeText(serviceTitle).toUpperCase();
  const titleWidth = fontBold.widthOfTextAtSize(titleUpper, 10.5);
  page.drawText(titleUpper, {
    x: width / 2 - titleWidth / 2,
    y: currentY - 12,
    size: 10.5,
    font: fontBold,
    color: navy,
  });

  currentY -= 30;

  // Metadata Sub-bar
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  page.drawText(`Date of Generation: ${dateStr}`, {
    x: 38,
    y: currentY,
    size: 8.5,
    font: fontRegular,
    color: textMuted,
  });

  if (trackingLabel) {
    page.drawText(`Digital Queue Token: ${sanitizeText(trackingLabel)}`, {
      x: width - 210,
      y: currentY,
      size: 9,
      font: fontBold,
      color: brandBlue,
    });
  } else if (isBlank) {
    page.drawText("OFFICIAL BLANK APPLICATION FORM", {
      x: width - 215,
      y: currentY,
      size: 8.5,
      font: fontBold,
      color: rgb(0.7, 0.15, 0.15),
    });
  }

  currentY -= 15;

  function drawSectionHeader(text: string, yPos: number) {
    page.drawRectangle({
      x: 35,
      y: yPos - 16,
      width: width - 70,
      height: 18,
      color: rgb(0.92, 0.94, 0.97),
      borderWidth: 0.8,
      borderColor: grayBorder,
    });
    page.drawText(text, {
      x: 44,
      y: yPos - 12,
      size: 9,
      font: fontBold,
      color: navy,
    });
  }

  // Section 1: Applicant Information
  drawSectionHeader("1. APPLICANT IDENTIFICATION", currentY);
  currentY -= 22;

  const detailsRows = [
    [
      { label: "Full Student Name:", val: isBlank ? "" : sanitizeText(studentDetails.fullName) },
    ],
    [
      { label: "TUF Student ID:", val: isBlank ? "" : sanitizeText(studentDetails.tufId) },
      { label: "Academic Year:", val: isBlank ? "" : sanitizeText(studentDetails.academicYear || "2026-27") },
    ],
    [
      { label: "Class / Year:", val: isBlank ? "" : sanitizeText(studentDetails.classYear) },
      { label: "Branch / Dept:", val: isBlank ? "" : sanitizeText(studentDetails.branch) },
    ],
    [
      { label: "Division / Roll No:", val: isBlank ? "" : sanitizeText(studentDetails.division || "N/A") },
    ],
  ];

  for (const row of detailsRows) {
    const rowHeight = 24;
    const colWidth = (width - 70) / row.length;

    for (let c = 0; c < row.length; c++) {
      const col = row[c];
      const startX = 35 + c * colWidth;

      page.drawRectangle({
        x: startX,
        y: currentY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: grayBorder,
      });

      page.drawText(col.label, {
        x: startX + 6,
        y: currentY - 16,
        size: 8,
        font: fontBold,
        color: textMuted,
      });

      if (col.val) {
        const labelW = fontBold.widthOfTextAtSize(col.label, 8);
        page.drawText(col.val, {
          x: startX + labelW + 12,
          y: currentY - 16,
          size: 8.5,
          font: fontBold,
          color: black,
        });
      }
    }
    currentY -= rowHeight;
  }

  currentY -= 15;

  // Section 2: Specific Requirements
  drawSectionHeader("2. SERVICE SPECIFICATIONS & PURPOSE", currentY);
  currentY -= 22;

  const extraEntries = Object.entries(extraFields);
  if (extraEntries.length > 0) {
    for (const [key, val] of extraEntries) {
      const rowHeight = 24;
      page.drawRectangle({
        x: 35,
        y: currentY - rowHeight,
        width: width - 70,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: grayBorder,
      });

      const labelFormatted = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      page.drawText(`${labelFormatted}:`, {
        x: 44,
        y: currentY - 16,
        size: 8.5,
        font: fontBold,
        color: textMuted,
      });

      if (!isBlank && val !== undefined && val !== "") {
        page.drawText(sanitizeText(val), {
          x: 200,
          y: currentY - 16,
          size: 8.5,
          font: fontRegular,
          color: black,
        });
      }
      currentY -= rowHeight;
    }
  } else {
    const rowHeight = 28;
    page.drawRectangle({
      x: 35,
      y: currentY - rowHeight,
      width: width - 70,
      height: rowHeight,
      borderWidth: 0.5,
      borderColor: grayBorder,
    });
    page.drawText("Standard student administration service request as per University rules.", {
      x: 44,
      y: currentY - 18,
      size: 8.5,
      font: fontOblique,
      color: textMuted,
    });
    currentY -= rowHeight;
  }

  currentY -= 16;

  // Section 3: Declaration
  drawSectionHeader("3. STUDENT UNDERTAKING & DECLARATION", currentY);
  currentY -= 22;

  page.drawRectangle({
    x: 35,
    y: currentY - 60,
    width: width - 70,
    height: 60,
    borderWidth: 0.5,
    borderColor: grayBorder,
  });

  page.drawText(
    "I hereby declare that the particulars furnished above are true and correct to the best of my knowledge.\nI undertake to abide by the rules and regulations of Terna Autonomous Engineering College.",
    {
      x: 44,
      y: currentY - 16,
      size: 8,
      font: fontRegular,
      color: black,
      lineHeight: 11,
    }
  );

  page.drawText("Date: ____________________", {
    x: 44,
    y: currentY - 48,
    size: 8.5,
    font: fontRegular,
    color: black,
  });

  page.drawText("Candidate Signature: ________________________", {
    x: width - 240,
    y: currentY - 48,
    size: 8.5,
    font: fontRegular,
    color: black,
  });

  currentY -= 75;

  // Section 4: Office Scrutiny
  drawSectionHeader("4. ADMINISTRATIVE SCRUTINY & SANCTION (OFFICE USE ONLY)", currentY);
  currentY -= 22;

  page.drawRectangle({
    x: 35,
    y: currentY - 95,
    width: width - 70,
    height: 95,
    borderWidth: 1,
    borderColor: navy,
    color: rgb(0.99, 0.99, 1.0),
  });

  page.drawText("Verification:   [  ] Verified & Approved     [  ] Discrepancy / Correction     [  ] Rejected", {
    x: 44,
    y: currentY - 18,
    size: 8.5,
    font: fontBold,
    color: navy,
  });

  page.drawText("Scrutiny Comments: ____________________________________________________________________________", {
    x: 44,
    y: currentY - 40,
    size: 8,
    font: fontRegular,
    color: black,
  });

  page.drawText("Accounts Clearance: [  ] Verified Paid    Receipt Ref: ____________________", {
    x: 44,
    y: currentY - 58,
    size: 8,
    font: fontRegular,
    color: black,
  });

  page.drawText("Dealing Clerk / Assistant Signature", {
    x: 48,
    y: currentY - 86,
    size: 8,
    font: fontBold,
    color: textMuted,
  });

  page.drawText("Office Superintendent / Registrar Stamp", {
    x: width - 225,
    y: currentY - 86,
    size: 8,
    font: fontBold,
    color: textMuted,
  });

  // Footer Note
  page.drawText(
    `${COLLEGE_CONFIG.name} • Official Academic Document • Alteration is strictly punishable`,
    {
      x: width / 2 - 165,
      y: 34,
      size: 7,
      font: fontOblique,
      color: textMuted,
    }
  );

  return await pdfDoc.save();
}

/**
 * Generates the official ISSUED CERTIFICATE PDF with atomic reference number,
 * QR verification code, college seal placeholder, and institutional header.
 */
export async function generateIssuedCertificatePdf(options: {
  referenceNumber: string;
  serviceTitle: string;
  studentName: string;
  tufId: string;
  classYear: string;
  branch: string;
  academicYear: string;
  purpose?: string;
  issueDate?: string;
}): Promise<Uint8Array> {
  const {
    referenceNumber,
    serviceTitle,
    studentName,
    tufId,
    classYear,
    branch,
    academicYear,
    purpose = "Bonafide College Requirement",
    issueDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  } = options;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.06, 0.09, 0.16);
  const brandBlue = rgb(0.11, 0.31, 0.85);
  const textDark = rgb(0.1, 0.1, 0.12);
  const textMuted = rgb(0.35, 0.4, 0.48);
  const goldBorder = rgb(0.82, 0.65, 0.25);

  // Elegant double institutional border for issued certificates
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderWidth: 2,
    borderColor: navy,
  });

  page.drawRectangle({
    x: 29,
    y: 29,
    width: width - 58,
    height: height - 58,
    borderWidth: 1,
    borderColor: goldBorder,
  });

  let currentY = height - 50;

  // Embed Logo
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: 48,
        y: currentY - 60,
        width: 70,
        height: 60,
      });
    } catch {}
  }

  // Header
  page.drawText(COLLEGE_CONFIG.name, {
    x: 130,
    y: currentY - 18,
    size: 14,
    font: fontBold,
    color: navy,
  });

  page.drawText(COLLEGE_CONFIG.affiliation, {
    x: 130,
    y: currentY - 33,
    size: 8,
    font: fontRegular,
    color: textMuted,
  });

  page.drawText(COLLEGE_CONFIG.address, {
    x: 130,
    y: currentY - 47,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  currentY -= 76;

  page.drawLine({
    start: { x: 30, y: currentY },
    end: { x: width - 30, y: currentY },
    thickness: 1.2,
    color: navy,
  });

  currentY -= 25;

  // Reference and Date Row
  page.drawText(`Ref No: ${sanitizeText(referenceNumber)}`, {
    x: 48,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: brandBlue,
  });

  page.drawText(`Date of Issue: ${issueDate}`, {
    x: width - 180,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  currentY -= 45;

  // Certificate Heading
  const certHeader = "BONAFIDE CERTIFICATE";
  const certW = fontBold.widthOfTextAtSize(certHeader, 16);
  page.drawText(certHeader, {
    x: width / 2 - certW / 2,
    y: currentY,
    size: 16,
    font: fontBold,
    color: navy,
  });

  currentY -= 8;
  page.drawLine({
    start: { x: width / 2 - certW / 2, y: currentY },
    end: { x: width / 2 + certW / 2, y: currentY },
    thickness: 1.5,
    color: brandBlue,
  });

  currentY -= 45;

  // Certificate Body Paragraph
  const paragraph = 
    `This is to certify that Mr./Ms. ${sanitizeText(studentName).toUpperCase()} ` +
    `bearing Student ID (TUF ID): ${sanitizeText(tufId)} is a bonafide student of this institute ` +
    `studying in Class ${sanitizeText(classYear)} of ${sanitizeText(branch)} ` +
    `during the Academic Year ${sanitizeText(academicYear)}.\n\n` +
    `To the best of our knowledge and college records, his/her conduct and character during ` +
    `the period of study have been found to be GOOD.\n\n` +
    `This certificate is issued upon his/her request for the purpose of ${sanitizeText(purpose)}.`;

  page.drawText(paragraph, {
    x: 48,
    y: currentY,
    size: 10.5,
    font: fontRegular,
    color: textDark,
    lineHeight: 18,
    maxWidth: width - 96,
  });

  currentY -= 170;

  // Verification QR Code
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ternaengg.ac.in"}/verify/${referenceNumber}`;
  try {
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 100, margin: 1 });
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, {
      x: 48,
      y: currentY - 50,
      width: 75,
      height: 75,
    });
    page.drawText("Scan to verify authenticity", {
      x: 48,
      y: currentY - 62,
      size: 7,
      font: fontOblique,
      color: textMuted,
    });
  } catch {}

  // Official Signature & Seal Blocks
  page.drawText("Prepared & Checked By", {
    x: 200,
    y: currentY - 35,
    size: 9,
    font: fontBold,
    color: textMuted,
  });

  page.drawText("Office In-Charge / Registrar", {
    x: width - 200,
    y: currentY - 35,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  page.drawText(`${COLLEGE_CONFIG.name}`, {
    x: width - 200,
    y: currentY - 48,
    size: 7.5,
    font: fontRegular,
    color: textMuted,
  });

  // Institutional Footer
  page.drawText(
    "Verified Digital Academic Credential • Terna Autonomous Engineering College",
    {
      x: width / 2 - 160,
      y: 38,
      size: 7.5,
      font: fontOblique,
      color: textMuted,
    }
  );

  return await pdfDoc.save();
}
