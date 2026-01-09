/* 
====================================
Paper Saving Module
Handles saving the finalized paper to Firestore.
====================================
*/

import { savePaperStructure } from './firestore.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

/**
 * Save Final Paper to Firestore
 * @param {Object} paperData - The complete paper object scraped from the editor
 */
export const saveFinalPaper = async (paperData) => {
    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated. Cannot save paper.");
        return null;
    }

    try {
        console.log("Saving paper...", paperData);

        // Prepare payload for Firestore
        // We ensure the structure matches what firestore.js expects
        const payload = {
            class: paperData.class,
            subject: paperData.subject,
            // We might have lost chapter info if we didn't store it in DOM, 
            // but we can retrieve it from the original draft or general metadata.
            // For now, assume paperData has what we need or we merge.
            chapters: paperData.chapters || [],

            // Exam Details (Header info)
            examDetails: {
                institution: paperData.institution,
                examName: paperData.examName,
                date: new Date().toISOString(), // Or parsed from UI
                duration: "3 Hrs", // Hardcoded or scraped
                maxMarks: paperData.totalMarks
            },

            // The questions array
            questions: paperData.questions,

            // Structure summary (re-calculated)
            structure: paperData.structure
        };

        const paperId = await savePaperStructure(user.uid, payload);

        if (paperId) {
            console.log("Paper saved successfully with ID:", paperId);
            // Clear draft from session as it is now persisted
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
