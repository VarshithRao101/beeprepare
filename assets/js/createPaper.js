
import { getUserQuestions, savePaperStructure } from './firestore.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

const waitForAuth = async () => {
    if (auth.currentUser) return auth.currentUser;
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (auth.currentUser) {
                clearInterval(interval);
                resolve(auth.currentUser);
            } else if (attempts > 20) { // 2 seconds
                clearInterval(interval);
                resolve(null);
            }
        }, 100);
    });
};

export const generatePaperDraft = async (config) => {

    const user = await waitForAuth();
    if (!user) {
        if (localStorage.getItem('qp_user')) {
            alert("Network delay: Auth not ready. Please try again in a moment.");
        } else {
            alert("Please login to generate paper.");
        }
        return false;
    }

    try {
        const filters = {
            class: config.class,
            subject: config.subject,
        };

        const allQuestions = await getUserQuestions(user.uid, filters);

        if (!allQuestions || allQuestions.length === 0) {
            alert(`No questions found in Question Bank for Class: ${config.class}, Subject: ${config.subject}. Please add questions first.`);
            return false;
        }

        let candidates = allQuestions;

        if (Array.isArray(config.chapter)) {
            if (!config.chapter.includes("All Chapters") && !config.chapter.includes("All")) {
                const targetChapters = config.chapter.map(c => c.trim());
                candidates = allQuestions.filter(q => q.chapter && targetChapters.includes(q.chapter.trim()));
            }
        }
        else if (config.chapter && config.chapter !== "All Chapters" && config.chapter !== "All") {
            candidates = allQuestions.filter(q => q.chapter && q.chapter.trim() === config.chapter.trim());
        }

        if (candidates.length === 0) {
            alert(`Found ${allQuestions.length} questions for this subject, but NONE matched the selected chapters.`);
            return false;
        }

        const selected = [];
        const missing = [];

        const pickRandom = (pool, count, typeLabel) => {
            if (pool.length < count) {
                missing.push(`${typeLabel} (Need ${count}, Found ${pool.length})`);
                return pool;
            }
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        const poolMCQ = candidates.filter(q => q.questionType === "MCQ" || q.marks === "MCQ");

        const pool2M = candidates.filter(q => q.marks == "2" && q.questionType !== "MCQ" && q.marks !== "MCQ");
        const pool4M = candidates.filter(q => q.marks == "4" && q.questionType !== "MCQ" && q.marks !== "MCQ");
        const pool8M = candidates.filter(q => q.marks == "6" && q.questionType !== "MCQ" && q.marks !== "MCQ");

        if (config.counts.mcq > 0) selected.push(...pickRandom(poolMCQ, config.counts.mcq, "MCQ"));
        if (config.counts.twoMark > 0) selected.push(...pickRandom(pool2M, config.counts.twoMark, "2 Marks"));
        if (config.counts.fourMark > 0) selected.push(...pickRandom(pool4M, config.counts.fourMark, "4 Marks"));
        if (config.counts.eightMark > 0) selected.push(...pickRandom(pool8M, config.counts.eightMark, "6 Marks"));

        if (missing.length > 0) {
            const proceed = confirm(`Shortage of questions:\n\n${missing.join('\n')}\n\nGenerate partial paper with what we have?`);
            if (!proceed) return false;
        }

        if (selected.length === 0) {
            alert("No questions selected. Please check if you have questions with the requested marks (2, 4, 8, MCQ) in the selected chapters.");
            return false;
        }

        const draft = {
            uid: user.uid,
            class: config.class,
            subject: config.subject,
            chapter: config.chapter,
            sectionOrder: config.sectionOrder,
            structure: config.counts,
            questions: selected,
            createdAt: new Date().toISOString(),
            totalMarks: calculateTotalMarks(selected)
        };

        sessionStorage.setItem('paperDraft', JSON.stringify(draft));
        console.log("Draft saved:", draft);

        return true;

    } catch (error) {
        console.error("Draft Generation Error:", error);
        alert("Error generating paper: " + error.message);
        return false;
    }
};

export const calculateTotalMarks = (questions) => {
    let total = 0;
    questions.forEach(q => {
        if (q.marks === "MCQ" || q.questionType === "MCQ") total += 1;
        else total += parseInt(q.marks) || 0;
    });
    return total;
};

export const getPaperDraft = () => {
    const data = sessionStorage.getItem('paperDraft');
    return data ? JSON.parse(data) : null;
};
