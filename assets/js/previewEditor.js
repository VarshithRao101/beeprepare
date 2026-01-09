/* 
====================================
Preview Editor Module
Handles enabling edit (contenteditable), validating, and scraping data from the DOM.
====================================
*/

/**
 * Enable Full Edit Mode
 * Adds contenteditable to specific elements if not already there.
 */
export const enableEditMode = () => {
    const editableSelectors = [
        '.paper-inst-name',
        '.paper-exam-name',
        '.paper-meta-grid', // Use care here, might break layout
        '.p-q-text',
        '.p-q-num',
        '.p-q-marks'
    ];

    // For sections/instructions, we might need specific IDs or reliable classes
    const instructions = document.querySelector('.paper-header-section').nextElementSibling;
    if (instructions) instructions.contentEditable = "true";

    editableSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.contentEditable = "true";
            el.style.border = "1px dashed rgba(255, 192, 0, 0.3)"; // Visual cue
            el.style.padding = "2px";
        });
    });

    // Section Headers
    document.querySelectorAll('.paper-question-list > div').forEach(div => {
        if (div.style.textDecoration === 'underline') {
            div.contentEditable = "true";
            div.style.border = "1px dashed rgba(255, 192, 0, 0.3)";
        }
    });

    console.log("Edit mode enabled.");
};

/**
 * Disable Edit Mode (Lock)
 */
export const disableEditMode = () => {
    const allEditable = document.querySelectorAll('[contenteditable="true"]');
    allEditable.forEach(el => {
        el.contentEditable = "false";
        el.style.border = "none";
        el.style.padding = "0"; // Reset (might affect layout slightly but safe)
    });
};

/**
 * Scrape Data from DOM to create Final Paper Object
 * merges with original draft metadata for things not on screen (like hidden chapter IDs)
 * @param {Object} originalDraft - The draft object from sessionStorage
 */
export const scrapePaperData = (originalDraft) => {
    const paper = { ...originalDraft }; // Copy base metadata

    // 1. Scrape Header Info
    const instName = document.querySelector('.paper-inst-name')?.innerText || "";
    const examName = document.querySelector('.paper-exam-name')?.innerText || "";

    paper.institution = instName;
    paper.examName = examName;

    // 2. Scrape Questions
    // We iterate through .paper-question-item
    const questionNodes = document.querySelectorAll('.paper-question-item');
    const finalQuestions = [];

    questionNodes.forEach(node => {
        const text = node.querySelector('.p-q-text')?.innerText || "";
        const marksText = node.querySelector('.p-q-marks')?.innerText || "[0]";
        const marksClean = marksText.replace('[', '').replace(']', '');

        // We try to find the original question ID if possible, but 
        // the current DOM doesn't store it. 
        // Ideally we should have stored data-id on the question items.
        // If we don't have it, we treat it as a "text-only" snapshot or 
        // rely on preserving order if user didn't reorder (we don't have drag-drop yet).
        // Let's create a new simplified question object for the 'final' version.

        finalQuestions.push({
            questionText: text,
            marks: marksClean, // "1", "2", "MCQ" etc
            // We lose original ID here unless we add it to DOM. 
            // For now, prompt implies logic is frontend focused.
            // We will save the text representation.
        });
    });

    paper.questions = finalQuestions;

    // 3. Recalculate Structure (Counts) based on finalized questions
    const structure = {
        mcq: 0,
        twoMark: 0,
        fourMark: 0,
        eightMark: 0
    };

    finalQuestions.forEach(q => {
        const m = q.marks.toLowerCase();
        if (m.includes('mcq') || m == '1') structure.mcq++;
        else if (m == '2') structure.twoMark++;
        else if (m == '4') structure.fourMark++;
        else if (m == '8') structure.eightMark++;
    });

    paper.structure = structure;

    return paper;
};
