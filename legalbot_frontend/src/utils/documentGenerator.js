import { saveAs } from "file-saver";
import { documentsAPI, sessionsAPI } from "../lib/api";

/**
 * Generate and download a PDF document from backend
 * @param {string} documentId - The document ID to download
 * @param {string} filename - The filename for the download
 */
export const generatePDFFromBackend = async (
  documentId,
  filename = "legal_document.pdf"
) => {
  try {
    const response = await documentsAPI.download(documentId, "pdf");

    // Create blob from response
    const blob = new Blob([response.data], { type: "application/pdf" });

    // Download the file
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error("Failed to download PDF document");
  }
};

/**
 * Generate and download a DOCX document from backend
 * @param {string} documentId - The document ID to download
 * @param {string} filename - The filename for the download
 */
export const generateDOCXFromBackend = async (
  documentId,
  filename = "legal_document.docx"
) => {
  try {
    const response = await documentsAPI.download(documentId, "docx");

    // Create blob from response
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Download the file
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error("Error downloading DOCX:", error);
    throw new Error("Failed to download DOCX document");
  }
};

/**
 * Create a document in backend and download as PDF
 * @param {string} content - The document content
 * @param {string} title - The document title
 * @param {string} filename - The filename for download
 */
export const createAndDownloadPDF = async (
  content,
  title = "Legal Document",
  filename = "legal_document.pdf"
) => {
  try {
    // First create a session for the document
    const sessionData = {
      title: title,
      status: "completed",
    };

    const sessionResponse = await sessionsAPI.create(sessionData);
    const sessionId = sessionResponse.data.id;

    // Then create the document in the backend
    const documentData = {
      session: sessionId,
      document_type: title,
      content: content,
    };

    const createResponse = await documentsAPI.create(documentData);
    const documentId = createResponse.data.id;

    // Then download it as PDF
    await generatePDFFromBackend(documentId, filename);
    return true;
  } catch (error) {
    console.error("Error creating and downloading PDF:", error);
    throw new Error("Failed to create and download PDF document");
  }
};

/**
 * Create a document in backend and download as DOCX
 * @param {string} content - The document content
 * @param {string} title - The document title
 * @param {string} filename - The filename for download
 */
export const createAndDownloadDOCX = async (
  content,
  title = "Legal Document",
  filename = "legal_document.docx"
) => {
  try {
    // First create a session for the document
    const sessionData = {
      title: title,
      status: "completed",
    };

    const sessionResponse = await sessionsAPI.create(sessionData);
    const sessionId = sessionResponse.data.id;

    // Then create the document in the backend
    const documentData = {
      session: sessionId,
      document_type: title,
      content: content,
    };

    const createResponse = await documentsAPI.create(documentData);
    const documentId = createResponse.data.id;

    // Then download it as DOCX
    await generateDOCXFromBackend(documentId, filename);
    return true;
  } catch (error) {
    console.error("Error creating and downloading DOCX:", error);
    throw new Error("Failed to create and download DOCX document");
  }
};

// Legacy client-side functions (kept as fallbacks)

/**
 * Generate and download a PDF document (client-side fallback)
 * @param {string} content - The document content (plain text or HTML)
 * @param {string} filename - The filename for the download
 */
export const generatePDF = async (content, filename = "legal_document.pdf") => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set up document styling
    pdf.setFont("times", "normal");
    pdf.setFontSize(12);

    // Convert HTML to plain text if needed
    const plainText = stripHtml(content);

    // Split content into lines and handle page breaks
    const lines = pdf.splitTextToSize(plainText, 170); // 170mm width for A4 with margins
    const pageHeight = 280; // A4 height minus margins
    const lineHeight = 7;
    let y = 20; // Start position

    lines.forEach((line, index) => {
      // Check if we need a new page
      if (y > pageHeight) {
        pdf.addPage();
        y = 20;
      }

      // Handle different text styles based on content
      if (isTitle(line)) {
        pdf.setFontSize(16);
        pdf.setFont("times", "bold");
        pdf.text(line, 105, y, { align: "center" });
        pdf.setFontSize(12);
        pdf.setFont("times", "normal");
        y += lineHeight + 3;
      } else if (isSection(line)) {
        pdf.setFont("times", "bold");
        pdf.text(line, 20, y);
        pdf.setFont("times", "normal");
        y += lineHeight + 2;
      } else if (line.trim()) {
        pdf.text(line, 20, y);
        y += lineHeight;
      } else {
        y += lineHeight / 2; // Smaller space for empty lines
      }
    });

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF document");
  }
};

/**
 * Generate and download a DOCX document
 * @param {string} content - The document content (plain text or HTML)
 * @param {string} filename - The filename for the download
 */
export const generateDOCX = async (
  content,
  filename = "legal_document.docx"
) => {
  try {
    // Convert HTML to plain text if needed
    const plainText = stripHtml(content);

    // Split content into paragraphs
    const paragraphs = plainText.split("\n").filter((line) => line.trim());

    // Create document paragraphs with proper styling
    const docParagraphs = paragraphs.map((paragraph) => {
      const trimmed = paragraph.trim();

      if (isTitle(trimmed)) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 32, // 16pt
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        });
      } else if (isSection(trimmed)) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 28, // 14pt
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        });
      } else if (trimmed) {
        return new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              size: 24, // 12pt
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        });
      } else {
        return new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { after: 100 },
        });
      }
    });

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    });

    // Generate and save the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate DOCX document");
  }
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text content
 */
const stripHtml = (html) => {
  if (!html) return "";

  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Get text content and clean up
  let text = temp.textContent || temp.innerText || "";

  // Clean up extra whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Add proper line breaks for paragraphs
  text = text.replace(/\. /g, ".\n");

  return text;
};

/**
 * Check if a line is a title (all caps or specific patterns)
 * @param {string} line - Text line to check
 * @returns {boolean} True if it's a title
 */
const isTitle = (line) => {
  if (!line || line.length < 5) return false;

  // Check if it's all uppercase and contains common title words
  const titleWords = [
    "CONTRACT",
    "AGREEMENT",
    "DOCUMENT",
    "TERMS",
    "CONDITIONS",
  ];
  const isAllCaps = line === line.toUpperCase();
  const containsTitleWord = titleWords.some((word) => line.includes(word));

  return isAllCaps && containsTitleWord;
};

/**
 * Check if a line is a section header
 * @param {string} line - Text line to check
 * @returns {boolean} True if it's a section header
 */
const isSection = (line) => {
  if (!line) return false;

  // Check for numbered sections or lines ending with colon
  const numberedSection = /^\d+\./.test(line.trim());
  const endsWithColon = line.trim().endsWith(":");
  const isShort = line.length < 50;

  return numberedSection || (endsWithColon && isShort);
};

/**
 * Generate filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} extension - File extension
 * @returns {string} Filename with timestamp
 */
export const generateFilename = (
  baseName = "legal_document",
  extension = "pdf"
) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
  return `${baseName}_${timestamp}.${extension}`;
};
