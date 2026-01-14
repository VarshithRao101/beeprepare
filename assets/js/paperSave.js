
import { savePaperStructure } from './firestore.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

export const saveFinalPaper = async (paperData) => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Cannot save paper.");
        return null;
    }

    try {
        console.log("Saving paper...", paperData);

        const payload = {
            class: paperData.class,
            subject: paperData.subject,
            chapters: paperData.chapters || [],

            examDetails: {
                institution: paperData.institution,
                examName: paperData.examName,
                date: new Date().toISOString(),
                duration: "3 Hrs",
                maxMarks: paperData.totalMarks
            },

            questions: paperData.questions,

            structure: paperData.structure
        };

        const paperId = await savePaperStructure(user.uid, payload);

        if (paperId) {
            console.log("Paper saved successfully with ID:", paperId);
            sessionStorage.removeItem('paperDraft');
            return paperId;
        } else {
            throw new Error("Save returned no ID");
        }

    } catch (error) {
        console.error("Save Final Paper Error:", error);
        alert("Failed to save final paper: " + error.message);
        return null;
    }
};
