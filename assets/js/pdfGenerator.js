/* 
====================================
PDF Generator Module
Handles client-side PDF generation using html2pdf.js
====================================
*/

/**
 * Generate PDF from a specific DOM element
 * @param {HTMLElement} element - The DOM element to convert to PDF (e.g. the paper div)
 * @param {Object} metadata - Metadata for filename generation
 */
export const generateQuestionPaperPDF = async (element, metadata) => {
    if (!window.html2pdf) {
        console.error("html2pdf library not found");
        alert("PDF library missing. Please check connection.");
        return false;
    }

    try {
        console.log("Generating PDF...");

        // Construct Filename: Institution_Subject_Date.pdf
        // Sanitize strings
        const safeName = (str) => (str || "Paper").replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const inst = safeName(metadata.institution || "School");
        const subj = safeName(metadata.subject || "Subject");
        const date = new Date().toISOString().split('T')[0];

        const filename = `${inst}_${subj}_${date}.pdf`;

        // PDF Options
        const opt = {
            margin: [10, 10, 10, 10], // mm: top, left, bottom, right
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, // Higher scale for better clarity
                useCORS: true,
                backgroundColor: '#ffffff' // Ensure white background
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // If we need to prepare the element (e.g. specific print styles), do it here or via clone
        // html2pdf automatically handles canvas creation from the element.

        // Wait for generation
        await window.html2pdf().set(opt).from(element).save();

        console.log("PDF Generated:", filename);
        return true;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF. Please try again.");
        return false;
    }
};
