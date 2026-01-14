
export const generateQuestionPaperPDF = async (element, metadata) => {
    if (!window.html2pdf) {
        console.error("html2pdf library not found");
        alert("PDF library missing. Please check connection.");
        return false;
    }

    try {
        console.log("Generating PDF...");

        const safeName = (str) => (str || "Paper").replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const inst = safeName(metadata.institution || "School");
        const subj = safeName(metadata.subject || "Subject");
        const date = new Date().toISOString().split('T')[0];

        const filename = `${inst}_${subj}_${date}.pdf`;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await window.html2pdf().set(opt).from(element).save();

        console.log("PDF Generated:", filename);
        return true;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF. Please try again.");
        return false;
    }
};
