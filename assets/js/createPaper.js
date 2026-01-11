/* 
====================================
Create Paper Logic Module
Handles question selection, randomization, drafts, and preview connection.
====================================
*/

import { getUserQuestions, savePaperStructure } from './firestore.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

/**
 * Generate Paper Draft
 * Fetches questions, samples them, and saves draft to sessionStorage.
 */
export const generatePaperDraft = async (config) => {
    // config expected: { class, subject, chapter, counts: { mcq, 2m, 4m, 8m } }

    const user = auth.currentUser;
    if (!user) {
        alert("Please login to generate paper.");
        return false;
    }

    try {
        // 1. Fetch ALL candidate questions
        // Note: Firestore 'in' query for marks or multiple queries.
        // For simplicity and client-side filtering flexibility:
        // We fetch questions for the class/subject/chapter context first.
        // Then we filter by marks client-side.

        const filters = {
            class: config.class,
            subject: config.subject,
            // chapter: config.chapter // firestore.js getUserQuestions doesn't support chapter filter in query strictly yet, so we filter after.
        };

        const allQuestions = await getUserQuestions(user.uid, filters);

        // Filter by Chapter (if specified and not "All")
        // If config.chapter is "All Chapters" or null, we take all.
        let candidates = allQuestions;

        // Check if config.chapter is an array (new multi-select behavior)
        if (Array.isArray(config.chapter)) {
            // If "All Chapters" is in the array, do not filter.
            if (!config.chapter.includes("All Chapters") && !config.chapter.includes("All")) {
                candidates = allQuestions.filter(q => config.chapter.includes(q.chapter));
            }
        }
        // Fallback for logic if plain string passed (legacy)
        else if (config.chapter && config.chapter !== "All Chapters" && config.chapter !== "All") {
            candidates = allQuestions.filter(q => q.chapter === config.chapter);
        }

        // 2. Select Questions per type
        const selected = [];
        const missing = [];

        // Helper to pick random
        const pickRandom = (pool, count, typeLabel) => {
            if (pool.length < count) {
                missing.push(`${typeLabel} (Need ${count}, Found ${pool.length})`);
                return pool; // Take all available
            }

            // Shuffle
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        // Filter pools
        // Fix: Use 'questionType' for MCQ check, as marks might be '1' or '2' even for MCQ.
        const poolMCQ = candidates.filter(q => q.questionType === "MCQ");

        // For other marks, exclude MCQs to avoid double counting if they happen to have matching marks
        const pool2M = candidates.filter(q => q.marks == "2" && q.questionType !== "MCQ");
        const pool4M = candidates.filter(q => q.marks == "4" && q.questionType !== "MCQ");
        const pool8M = candidates.filter(q => q.marks == "8" && q.questionType !== "MCQ");

        if (config.counts.mcq > 0) selected.push(...pickRandom(poolMCQ, config.counts.mcq, "MCQ"));
        if (config.counts.twoMark > 0) selected.push(...pickRandom(pool2M, config.counts.twoMark, "2 Marks"));
        if (config.counts.fourMark > 0) selected.push(...pickRandom(pool4M, config.counts.fourMark, "4 Marks"));
        if (config.counts.eightMark > 0) selected.push(...pickRandom(pool8M, config.counts.eightMark, "8 Marks"));

        // 3. Validation
        if (missing.length > 0) {
            const proceed = confirm(`Insufficient questions found for:\n${missing.join('\n')}\n\nGenerate with available questions only?`);
            if (!proceed) return false;
        }

        if (selected.length === 0) {
            alert("No questions selected based on your criteria.");
            return false;
        }

        // 4. Create Draft Object
        const draft = {
            uid: user.uid,
            class: config.class,
            subject: config.subject,
            chapter: config.chapter, // Single chapter or "All"
            structure: config.counts,
            questions: selected,
            createdAt: new Date().toISOString(),
            totalMarks: calculateTotalMarks(selected)
        };

        // 5. Save to Session
        sessionStorage.setItem('paperDraft', JSON.stringify(draft));
        console.log("Draft saved:", draft);

        return true;

    } catch (error) {
        console.error("Draft Generation Error:", error);
        alert("Error generating paper: " + error.message);
        return false;
    }
};

/**
 * Calculate Total Marks from Question Objects
 */
export const calculateTotalMarks = (questions) => {
    let total = 0;
    questions.forEach(q => {
        if (q.marks === "MCQ") total += 1;
        else total += parseInt(q.marks) || 0;
    });
    return total;
};

/**
 * Get Draft from Storage (for Preview)
 */
export const getPaperDraft = () => {
    const data = sessionStorage.getItem('paperDraft');
    return data ? JSON.parse(data) : null;
};
