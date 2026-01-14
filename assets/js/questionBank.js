
import {
    addQuestionToBank,
    getUserQuestions,
    deleteQuestionFromBank
} from './firestore.js';

import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const auth = getAuth();

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
            topic: questionPayload.topic || "",
            marks: questionPayload.marks || "1",
            type: questionPayload.type || "Short Answer",
            options: questionPayload.options || null,
            correctAnswer: questionPayload.correctAnswer || null
        });
        return true;
    } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save question: " + error.message);
        return false;
    }
};

export const fetchAndRenderQuestions = async (containerId, filters) => {
    const user = auth.currentUser;
    if (!user) {
        console.log("User not logged in, cannot fetch questions.");
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Loading questions...</div>';

    try {
        const questions = await getUserQuestions(user.uid, filters);

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

export const setupGlobalDelete = () => {
    window.deleteQuestion = async (qId) => {
        if (!confirm("Are you sure you want to delete this question?")) return;

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to delete.");
            return;
        }

        const el = document.getElementById(`q-${qId}`);
        if (el) el.style.opacity = '0.3';

        try {
            await deleteQuestionFromBank(user.uid, qId);
            if (el) el.remove();
        } catch (e) {
            console.error(e);
            alert("Could not delete question.");
            if (el) el.style.opacity = '1';
        }
    };
};
