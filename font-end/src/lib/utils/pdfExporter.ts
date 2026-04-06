import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";

/**
 * PDF Export Utility using dom-to-image-more
 *
 * This utility handles the export of DOM elements to PDF format using dom-to-image-more,
 * which provides better compatibility with modern CSS color functions (lab(), lch())
 * used by Tailwind CSS and Shadcn/UI.
 *
 * Key improvements:
 * - Uses dom-to-image-more instead of html2canvas for better CSS compatibility
 * - Handles modern color functions without parsing errors
 * - Provides consistent white background rendering
 * - Maintains high-quality output with proper aspect ratio handling
 *
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The desired name for the downloaded PDF file.
 */
export const exportElementToPdf = async (
  elementId: string,
  fileName: string
) => {
  const node = document.getElementById(elementId);

  if (!node) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  try {
    // Use domtoimage.toPng to convert the DOM node to a PNG data URL
    const imageData = await domtoimage.toPng(node, {
      quality: 0.95,
      bgcolor: "#ffffff", // Always render on a solid white background for consistency
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "scale(1)",
        "transform-origin": "top left",
      },
    });

    // Create a new PDF document in A4 size, portrait orientation
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    // Create a temporary image object to get its natural dimensions
    const img = new Image();
    img.src = imageData;

    // Wait for the image to load to get its dimensions
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Calculate aspect ratio to fit the image to the PDF width
    const ratio = imgWidth / imgHeight;
    const imageWidth = pdfWidth - 20; // Subtracting 10mm margin from each side
    const imageHeight = imageWidth / ratio;

    // Add the captured image to the PDF
    pdf.addImage(imageData, "PNG", 10, 10, imageWidth, imageHeight);

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to export PDF with dom-to-image:", error);
    // You should add a user-facing error toast here
    throw new Error("PDF export failed. Please try again.");
  }
};

/**
 * Alternative export function that creates a simplified version for better compatibility
 * This function creates a clone of the element with simplified styles before export
 *
 * @param elementId The ID of the HTML element to capture.
 * @param fileName The desired name for the downloaded PDF file.
 */
export const exportElementToPdfSimple = async (
  elementId: string,
  fileName: string
) => {
  const node = document.getElementById(elementId);

  if (!node) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  // Create a clone of the element to avoid modifying the original
  const clone = node.cloneNode(true) as HTMLElement;

  // Apply simplified styles to the clone
  clone.style.cssText = `
    background: white !important;
    color: black !important;
    font-family: Arial, sans-serif !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    margin: 0 !important;
    padding: 20px !important;
    border: none !important;
    box-shadow: none !important;
  `;

  // Remove problematic elements and simplify styles
  const elementsToRemove = clone.querySelectorAll("script, style, .no-export");
  elementsToRemove.forEach((el) => el.remove());

  // Simplify all child elements
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((element) => {
    const el = element as HTMLElement;
    // Remove complex styles that might cause issues
    el.style.removeProperty("background");
    el.style.removeProperty("background-color");
    el.style.removeProperty("color");
    el.style.removeProperty("border");
    el.style.removeProperty("border-color");
    el.style.removeProperty("box-shadow");
    el.style.removeProperty("text-shadow");
    el.style.removeProperty("filter");
    el.style.removeProperty("transform");
    el.style.removeProperty("transition");
    el.style.removeProperty("animation");

    // Apply basic styles
    el.style.fontFamily = "Arial, sans-serif";
    el.style.fontSize = "12px";
    el.style.lineHeight = "1.4";
    el.style.color = "#000000";
    el.style.backgroundColor = "#ffffff";
    el.style.border = "1px solid #e5e7eb";
  });

  // Temporarily add the clone to the document
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  document.body.appendChild(clone);

  try {
    // Use domtoimage.toPng with simplified options
    const imageData = await domtoimage.toPng(clone, {
      quality: 0.9,
      bgcolor: "#ffffff",
      width: clone.scrollWidth,
      height: clone.scrollHeight,
    });

    // Create a new PDF document in A4 size, portrait orientation
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    // Create a temporary image object to get its natural dimensions
    const img = new Image();
    img.src = imageData;

    // Wait for the image to load to get its dimensions
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Calculate aspect ratio to fit the image to the PDF width
    const ratio = imgWidth / imgHeight;
    const imageWidth = pdfWidth - 20; // Subtracting 10mm margin from each side
    const imageHeight = imageWidth / ratio;

    // Add the captured image to the PDF
    pdf.addImage(imageData, "PNG", 10, 10, imageWidth, imageHeight);

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to export simplified PDF:", error);
    throw new Error("PDF export failed. Please try again.");
  } finally {
    // Remove the clone from the document
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};
