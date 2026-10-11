import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
 * Generates an official college format application PDF on the server.
 * Supports both blank downloadable forms and filled preview/submission forms.
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
  const black = rgb(0.1, 0.1, 0.1);
  const darkNavy = rgb(0.08, 0.18, 0.36);
  const grayBorder = rgb(0.75, 0.78, 0.82);
  const lightGrayBg = rgb(0.96, 0.97, 0.98);
  const textMuted = rgb(0.4, 0.44, 0.5);

  let currentY = height - 40;

  // Outer Border
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderWidth: 1.5,
    borderColor: darkNavy,
  });

  // Inner border margin
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderWidth: 0.5,
    borderColor: grayBorder,
  });

  // Header Banner
  page.drawRectangle({
    x: 29,
    y: currentY - 55,
    width: width - 58,
    height: 65,
    color: darkNavy,
  });

  page.drawText("PRAYAS INSTITUTE OF TECHNOLOGY & SCIENCE", {
    x: width / 2 - 180,
    y: currentY - 15,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Affiliated to State Technical Board | Approved by AICTE | NAAC Accredited", {
    x: width / 2 - 175,
    y: currentY - 32,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 0.98),
  });

  page.drawText("ADMINISTRATIVE OFFICE • STUDENT SERVICES DIVISION", {
    x: width / 2 - 140,
    y: currentY - 48,
    size: 9,
    font: fontBold,
    color: rgb(0.95, 0.8, 0.4),
  });

  currentY -= 75;

  // Title Ribbon
  page.drawRectangle({
    x: 40,
    y: currentY - 26,
    width: width - 80,
    height: 28,
    color: lightGrayBg,
    borderColor: grayBorder,
    borderWidth: 1,
  });

  const titleUpper = serviceTitle.toUpperCase();
  const titleWidth = fontBold.widthOfTextAtSize(titleUpper, 12);
  page.drawText(titleUpper, {
    x: width / 2 - titleWidth / 2,
    y: currentY - 18,
    size: 12,
    font: fontBold,
    color: darkNavy,
  });

  currentY -= 38;

  // Tracking info / Form status bar
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  page.drawText(`Date of Generation: ${dateStr}`, {
    x: 42,
    y: currentY,
    size: 9,
    font: fontRegular,
    color: textMuted,
  });

  if (trackingLabel) {
    page.drawText(`Digital Token Reference: ${trackingLabel}`, {
      x: width - 230,
      y: currentY,
      size: 9,
      font: fontBold,
      color: darkNavy,
    });
  } else if (isBlank) {
    page.drawText("OFFICIAL BLANK APPLICATION FORM", {
      x: width - 230,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.6, 0.1, 0.1),
    });
  }

  currentY -= 15;

  // Section 1: Student Particulars
  function drawSectionHeader(text: string, yPos: number) {
    page.drawRectangle({
      x: 40,
      y: yPos - 18,
      width: width - 80,
      height: 20,
      color: rgb(0.92, 0.94, 0.97),
      borderWidth: 1,
      borderColor: grayBorder,
    });
    page.drawText(text, {
      x: 50,
      y: yPos - 13,
      size: 10,
      font: fontBold,
      color: darkNavy,
    });
  }

  drawSectionHeader("1. APPLICANT DETAILS", currentY);
  currentY -= 26;

  // Table rows for applicant details
  const detailsRows = [
    [
      { label: "Full Name (as per ID card):", val: isBlank ? "" : (studentDetails.fullName || "") },
    ],
    [
      { label: "TUF Student ID:", val: isBlank ? "" : (studentDetails.tufId || "") },
      { label: "Academic Year:", val: isBlank ? "" : (studentDetails.academicYear || "2026-27") },
    ],
    [
      { label: "Class / Year:", val: isBlank ? "" : (studentDetails.classYear || "") },
      { label: "Branch / Dept:", val: isBlank ? "" : (studentDetails.branch || "") },
    ],
    [
      { label: "Division / Roll No:", val: isBlank ? "" : (studentDetails.division || "N/A") },
    ],
  ];

  for (const row of detailsRows) {
    const rowHeight = 26;
    const colWidth = (width - 80) / row.length;

    for (let c = 0; c < row.length; c++) {
      const col = row[c];
      const startX = 40 + c * colWidth;

      page.drawRectangle({
        x: startX,
        y: currentY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: grayBorder,
      });

      page.drawText(col.label, {
        x: startX + 8,
        y: currentY - 17,
        size: 8.5,
        font: fontBold,
        color: textMuted,
      });

      const labelWidth = fontBold.widthOfTextAtSize(col.label, 8.5);
      const valX = startX + labelWidth + 14;

      if (col.val) {
        page.drawText(String(col.val), {
          x: valX,
          y: currentY - 17,
          size: 9,
          font: fontBold,
          color: black,
        });
      }
    }
    currentY -= rowHeight;
  }

  currentY -= 15;

  // Section 2: Request Specifications
  drawSectionHeader("2. APPLICATION SPECIFIC REQUIREMENTS", currentY);
  currentY -= 26;

  const extraEntries = Object.entries(extraFields);
  if (extraEntries.length > 0) {
    for (const [key, value] of extraEntries) {
      const rowHeight = 26;
      page.drawRectangle({
        x: 40,
        y: currentY - rowHeight,
        width: width - 80,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: grayBorder,
      });

      const formattedKey = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      page.drawText(`${formattedKey}:`, {
        x: 48,
        y: currentY - 17,
        size: 9,
        font: fontBold,
        color: textMuted,
      });

      if (!isBlank && value !== undefined && value !== "") {
        page.drawText(String(value), {
          x: 220,
          y: currentY - 17,
          size: 9.5,
          font: fontRegular,
          color: black,
        });
      }
      currentY -= rowHeight;
    }
  } else {
    // Blank generic line if no extra fields
    const rowHeight = 35;
    page.drawRectangle({
      x: 40,
      y: currentY - rowHeight,
      width: width - 80,
      height: rowHeight,
      borderWidth: 0.5,
      borderColor: grayBorder,
    });
    page.drawText("Standard student verification application as per college rules.", {
      x: 48,
      y: currentY - 22,
      size: 9,
      font: fontOblique,
      color: textMuted,
    });
    currentY -= rowHeight;
  }

  currentY -= 15;

  // Section 3: Applicant Declaration
  drawSectionHeader("3. UNDERTAKING & DECLARATION", currentY);
  currentY -= 26;

  page.drawRectangle({
    x: 40,
    y: currentY - 70,
    width: width - 80,
    height: 70,
    borderWidth: 0.5,
    borderColor: grayBorder,
  });

  const declarationText =
    "I declare that all details entered above are true and complete. I understand that any false statement\nwill lead to cancellation of this request and possible disciplinary action by the administration office.";

  page.drawText(declarationText, {
    x: 48,
    y: currentY - 18,
    size: 8.5,
    font: fontRegular,
    color: black,
    lineHeight: 12,
  });

  page.drawText("Date: ____________________", {
    x: 48,
    y: currentY - 55,
    size: 9,
    font: fontRegular,
    color: black,
  });

  page.drawText("Student Signature: ________________________", {
    x: width - 260,
    y: currentY - 55,
    size: 9,
    font: fontRegular,
    color: black,
  });

  currentY -= 85;

  // Section 4: For Administrative Office Use Only
  drawSectionHeader("4. FOR ADMINISTRATIVE OFFICE USE ONLY", currentY);
  currentY -= 26;

  page.drawRectangle({
    x: 40,
    y: currentY - 105,
    width: width - 80,
    height: 105,
    borderWidth: 1,
    borderColor: darkNavy,
    color: rgb(0.98, 0.99, 1.0),
  });

  page.drawText("Verification Status:  [  ] Verified & Approved     [  ] Correction Required     [  ] Rejected", {
    x: 48,
    y: currentY - 20,
    size: 9,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText("Scrutiny Remarks: ____________________________________________________________________________", {
    x: 48,
    y: currentY - 45,
    size: 8.5,
    font: fontRegular,
    color: black,
  });

  page.drawText("Fee / Dues Clearance (if applicable): [  ] Cleared   Receipt No: ______________", {
    x: 48,
    y: currentY - 65,
    size: 8.5,
    font: fontRegular,
    color: black,
  });

  page.drawText("Dealing Assistant Signature", {
    x: 55,
    y: currentY - 95,
    size: 8.5,
    font: fontBold,
    color: textMuted,
  });

  page.drawText("Superintendent / Office In-Charge Stamp", {
    x: width - 240,
    y: currentY - 95,
    size: 8.5,
    font: fontBold,
    color: textMuted,
  });

  // Footer Note
  page.drawText(
    "Note: This is an official system-generated college form. Alteration of this document is strictly prohibited.",
    {
      x: width / 2 - 180,
      y: 35,
      size: 7.5,
      font: fontOblique,
      color: textMuted,
    }
  );

  return await pdfDoc.save();
}
