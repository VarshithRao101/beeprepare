
export const enableEditMode = () => {
    const editableSelectors = [
        '.paper-inst-name',
        '.paper-exam-name',
        '.paper-meta-grid',
        '.p-q-text',
        '.p-q-num',
        '.p-q-marks'
    ];

    const instructions = document.querySelector('.paper-header-section').nextElementSibling;
    if (instructions) instructions.contentEditable = "true";

    editableSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.contentEditable = "true";
            el.style.border = "1px dashed rgba(255, 192, 0, 0.3)";
            el.style.padding = "2px";
        });
    });

    document.querySelectorAll('.paper-question-list > div').forEach(div => {
        if (div.style.textDecoration === 'underline') {
            div.contentEditable = "true";
            div.style.border = "1px dashed rgba(255, 192, 0, 0.3)";
        }
    });

    console.log("Edit mode enabled.");
};

export const disableEditMode = () => {
    const allEditable = document.querySelectorAll('[contenteditable="true"]');
    allEditable.forEach(el => {
        el.contentEditable = "false";
        el.style.border = "none";
        el.style.padding = "0";
    });
};

export const scrapePaperData = (originalDraft) => {
    const paper = { ...originalDraft };

    const instName = document.querySelector('.paper-inst-name')?.innerText || "";
    const examName = document.querySelector('.paper-exam-name')?.innerText || "";

    paper.institution = instName;
    paper.examName = examName;

    const questionNodes = document.querySelectorAll('.paper-question-item');
    const finalQuestions = [];

    questionNodes.forEach(node => {
        const text = node.querySelector('.p-q-text')?.innerText || "";
        const marksText = node.querySelector('.p-q-marks')?.innerText || "[0]";
        const marksClean = marksText.replace('[', '').replace(']', '');

        finalQuestions.push({
            questionText: text,
            marks: marksClean,
        });
    });

    paper.questions = finalQuestions;

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
