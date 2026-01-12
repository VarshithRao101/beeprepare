/* 
====================================
Question Bank Logic Module
Handles adding, fetching, and managing questions via Firestore
====================================
*/

import {
    addQuestionToBank,
    getUserQuestions,
    deleteQuestionFromBank // We need to add this to firestore.js first or implement here? 
    // Instruction said "Keep code modular". 
    // I'll implement delete logic here using firestore primitives if needed, 
    // but better to add to firestore.js? 
    // The prompt says "Implement Question Bank logic using Firestore".
    // I will stick to using firestore.js for DB interactions if possible.
    // But I need to add deleteQuestionFromBank to firestore.js? 
    // Or I can import DB here. 
    // Let's import DB primitives here to implement specific logic if firestore.js doesn't have it.
    // Actually, firestore.js from previous step didn't have delete. 
    // I will add it to this file or firestore.js. 
    // Let's keep DB logic in firestore.js to be clean.
} from './firestore.js';

import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

/**
 * Handle Saving a New Question
 * Called from add_question.html
 */
export const handleSaveNewQuestion = async (text, questionPayload) => {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save questions.");
        return false;
    }

    if (!text || !text.trim()) {
        alert("Question text cannot be empty.");
        return false;
    }

    try {
        await addQuestionToBank(user.uid, {
            questionText: text,
            class: questionPayload.class || "Unspecified",
            subject: questionPayload.subject || "Unspecified",
            chapter: questionPayload.chapter || "Unspecified",
            topic: questionPayload.topic || "", // Added Topic
            marks: questionPayload.marks || "1",
            type: questionPayload.type || "Short Answer",
            options: questionPayload.options || null, // For MCQs
            correctAnswer: questionPayload.correctAnswer || null
        });
        return true;
    } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save question: " + error.message);
        return false;
    }
};

/**
 * Handle Fetching and Rendering Questions
 * Called from question-bank.html
 */
export const fetchAndRenderQuestions = async (containerId, filters) => {
    const user = auth.currentUser;
    if (!user) {
        console.log("User not logged in, cannot fetch questions.");
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    // Show Loading
    container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Loading questions...</div>';

    try {
        const questions = await getUserQuestions(user.uid, filters);

        // Filter currently only supports Class/Subject in firestore.js version.
        // We might need to do client-side filtering for Chapter/Marks if backend query doesn't support it composite yet.
        // Let's refine the client side filter for now to be safe.

        const filteredQ = questions.filter(q => {
            let match = true;
            if (filters.chapter && q.chapter !== filters.chapter) match = false;
            if (filters.marks && q.marks !== filters.marks) match = false;
            return match;
        });

        if (filteredQ.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary); font-style:italic;">No questions found for this criteria.</div>';
            return;
        }

        // Render List
        let html = '<div style="margin-top:20px;">';
        html += '<h4 style="color:var(--text-primary); margin-bottom:10px;">Existing Questions</h4>';

        filteredQ.forEach((q, index) => {
            html += `
                <div class="card-hover" id="q-${q.id}" style="
                    background: var(--card-grey); 
                    border: 1px solid var(--border-grey); 
                    padding: 15px; 
                    margin-bottom: 10px; 
                    border-radius: 8px; 
                    border-left: 3px solid var(--yellow);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                ">
                    <div style="flex: 1;">
                        <div style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 5px;">${q.questionText}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${q.marks} Marks • ${q.chapter}
                        </div>
                    </div>
                    <button onclick="window.deleteQuestion('${q.id}')" style="
                        background: none; 
                        border: none; 
                        opacity: 0.6; 
                        cursor: pointer; 
                        padding: 4px;
                        transition: opacity 0.2s;
                    " onmouseover="this.style.opacity=1; this.style.color='var(--danger)';" onmouseout="this.style.opacity=0.6; this.style.color='inherit';">
                        <img src="../assets/images/icon-close.svg" width="16" style="filter: invert(1);"> 
                        
                    </button>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = '<div style="color:var(--danger); text-align:center;">Error loading questions.</div>';
    }
};

/**
 * Delete Helper
 * We need to inject the logic into window because HTML onclick uses global scope
 */
export const setupGlobalDelete = () => {
    window.deleteQuestion = async (qId) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to delete.");
            return;
        }

        // Remove from UI immediately for responsiveness
        const el = document.getElementById(`q-${qId}`);
        if (el) el.style.opacity = '0.3';

        try {
            // Pass UID and QID
            await deleteQuestionFromBank(user.uid, qId);
            if (el) el.remove();
        } catch (e) {
            console.error(e);
            alert("Could not delete question.");
            if (el) el.style.opacity = '1';
        }
    };
};
