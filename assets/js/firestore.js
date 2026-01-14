
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2tMnUB37paF5qoVD3ahp7Q3IKMIoHghw",
    authDomain: "beeprepare-a4e5d.firebaseapp.com",
    projectId: "beeprepare-a4e5d",
    storageBucket: "beeprepare-a4e5d.firebasestorage.app",
    messagingSenderId: "127936798358",
    appId: "1:127936798358:web:4d7a1291f6a12c686fecb7",
    measurementId: "G-XXPN9T2P74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USERS_COL = "users";
const QUESTIONS_COL = "questions";
const PAPERS_COL = "papers";

export const syncUserProfile = async (user) => {
    if (!user) return;

    const userRef = doc(db, USERS_COL, user.uid);

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("Creating new user profile...");
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                subjects: [],
                classes: [],
                isPremium: false,
                createdAt: serverTimestamp()
            });
        } else {
            console.log("User profile exists.");
        }
    } catch (error) {
        console.error("Error syncing user profile:", error);
        throw error;
    }
};

export const getUserProfileData = async (uid) => {
    if (!uid) return null;
    try {
        const userSnap = await getDoc(doc(db, USERS_COL, uid));
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const saveUserSubjects = async (uid, subjectsArray) => {
    try {
        const userRef = doc(db, USERS_COL, uid);
        await updateDoc(userRef, {
            subjects: subjectsArray
        });
        console.log("Subjects updated");
    } catch (error) {
        console.error("Error saving subjects:", error);
    }
};

export const saveUserClasses = async (uid, classesArray) => {
    try {
        const userRef = doc(db, USERS_COL, uid);
        await updateDoc(userRef, {
            classes: classesArray
        });
        console.log("Classes updated");
    } catch (error) {
        console.error("Error saving classes:", error);
    }
};

export const saveUserChapterPreferences = async (uid, classSubjectKey, chaptersArray) => {
    try {
        const userRef = doc(db, USERS_COL, uid);
        await updateDoc(userRef, {
            [`chapterPreferences.${classSubjectKey}`]: chaptersArray
        });
        console.log(`Chapters updated for ${classSubjectKey}`);
    } catch (error) {
        console.error("Error saving chapters:", error);
        try {
            const userRef = doc(db, USERS_COL, uid);
            await setDoc(userRef, {
                chapterPreferences: {
                    [classSubjectKey]: chaptersArray
                }
            }, { merge: true });
        } catch (retryError) {
            console.error("Retry saving chapters failed:", retryError);
        }
    }
};

export const addQuestionToBank = async (uid, questionData) => {
    if (!uid) throw new Error("User ID required");

    try {
        const qPayload = {
            class: questionData.class || "Unspecified",
            subject: questionData.subject || "Unspecified",
            chapter: questionData.chapter || "Unspecified",
            marks: questionData.marks || "1",
            questionType: questionData.type || "Short Answer",
            questionText: questionData.questionText,

            options: questionData.options || null,
            correctOption: questionData.correctAnswer || null,

            createdAt: serverTimestamp()
        };

        const userQuestionsRef = collection(db, USERS_COL, uid, "questions");

        const totalSnap = await getCountFromServer(userQuestionsRef);
        const totalCount = totalSnap.data().count;

        if (totalCount >= 3000) {
            throw new Error("LIMIT REACHED: You have reached the maximum limit of 3000 questions per account.");
        }

        const subjectQ = query(userQuestionsRef, where("subject", "==", qPayload.subject));
        const subSnap = await getCountFromServer(subjectQ);
        const subCount = subSnap.data().count;

        if (subCount >= 1500) {
            throw new Error(`LIMIT REACHED: You have reached the maximum limit of 1500 questions for ${qPayload.subject}.`);
        }

        const docRef = await addDoc(userQuestionsRef, qPayload);
        console.log("Question added with ID: ", docRef.id);

        await logUserActivity(uid, 'question_added', 'Added Question', `${questionData.class} • ${questionData.subject}`);

        return docRef.id;

    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
};

export const deleteQuestionFromBank = async (uid, qId) => {
    if (!uid || !qId) return;
    try {
        await deleteDoc(doc(db, USERS_COL, uid, "questions", qId));
        console.log("Question deleted:", qId);

        await logUserActivity(uid, 'question_deleted', 'Deleted Question', 'Question removed from bank');

    } catch (error) {
        console.error("Error deleting question:", error);
        throw error;
    }
};

export const updateQuestion = async (uid, qId, data) => {
    if (!uid || !qId || !data) return;
    try {
        const qRef = doc(db, USERS_COL, uid, "questions", qId);
        await updateDoc(qRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        console.log("Question updated:", qId);
    } catch (error) {
        console.error("Error updating question:", error);
        throw error;
    }
};

export const getUserQuestions = async (uid, filters = {}) => {
    try {
        const userQuestionsRef = collection(db, USERS_COL, uid, "questions");

        let q = query(userQuestionsRef);

        if (filters.subject) {
            q = query(q, where("subject", "==", filters.subject));
        }
        if (filters.class) {
            q = query(q, where("class", "==", filters.class));
        }

        const querySnapshot = await getDocs(q);
        let questions = [];
        querySnapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });

        questions.sort((a, b) => {
            const tA = a.createdAt ? a.createdAt.toMillis() : 0;
            const tB = b.createdAt ? b.createdAt.toMillis() : 0;
            return tB - tA;
        });

        return questions;

    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
};

export const logUserActivity = async (uid, type, title, detail) => {
    if (!uid) return;
    try {
        const activityRef = collection(db, USERS_COL, uid, "activity");
        await addDoc(activityRef, {
            type,
            title,
            detail,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error logging activity:", e);
    }
};

export const getUserActivity = async (uid, limitCount = 20) => {
    try {
        const activityRef = collection(db, USERS_COL, uid, "activity");
        const q = query(activityRef, orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);

        const activities = [];
        snapshot.forEach(doc => {
            if (activities.length < limitCount) {
                activities.push({ id: doc.id, ...doc.data() });
            }
        });
        return activities;

    } catch (e) {
        console.error("Activity fetch error", e);
        return [];
    }
};

export const savePaperStructure = async (uid, paperData) => {
    try {
        const payload = {
            uid: uid,
            class: paperData.class,
            subject: paperData.subject,
            chapters: paperData.chapters || [],
            structure: paperData.structure || {
                mcq: 0,
                twoMark: 0,
                fourMark: 0,
                eightMark: 0
            },
            examDetails: paperData.examDetails || {
                institution: "",
                examName: "",
                date: "",
                duration: "",
                maxMarks: 0
            },
            questions: paperData.questions || [],
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, PAPERS_COL), payload);
        console.log("Paper structure saved ID:", docRef.id);
        return docRef.id;

    } catch (error) {
        console.error("Error saving paper structure:", error);
        throw error;
    }
};

export const getUserPapers = async (uid) => {
    try {
        const q = query(
            collection(db, PAPERS_COL),
            where("uid", "==", uid),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const papers = [];
        querySnapshot.forEach((doc) => {
            papers.push({ id: doc.id, ...doc.data() });
        });
        return papers;

    } catch (error) {
        console.error("Error fetching papers:", error);
        return [];
    }
};

import { runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const activateUserAccount = async (uid, keyString) => {
    if (!uid || !keyString) throw new Error("Invalid details");

    try {
        await runTransaction(db, async (transaction) => {
            const keyRef = doc(db, "license_keys", keyString);
            const keySnap = await transaction.get(keyRef);

            if (!keySnap.exists()) {
                throw "Invalid License Key";
            }

            const keyData = keySnap.data();
            if (keyData.status === "used") {
                throw "License Key already used";
            }

            const userRef = doc(db, USERS_COL, uid);
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) {
                throw "User profile not found";
            }

            transaction.update(keyRef, {
                status: "used",
                usedBy: uid,
                usedAt: serverTimestamp()
            });

            transaction.update(userRef, {
                isPremium: true,
                licenseKey: keyString,
                premiumActivatedAt: serverTimestamp()
            });
        });

        console.log("Account activated successfully!");
        return { success: true };

    } catch (e) {
        console.error("Activation Failed:", e);
        return { success: false, error: e.toString() };
    }
};

import { writeBatch } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const batchUploadKeys = async (keysList) => {
    const CHUNK_SIZE = 450;
    const chunks = [];

    for (let i = 0; i < keysList.length; i += CHUNK_SIZE) {
        chunks.push(keysList.slice(i, i + CHUNK_SIZE));
    }

    let totalUploaded = 0;

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(k => {
            const ref = doc(db, "license_keys", k.key);
            batch.set(ref, {
                key: k.key,
                sno: k.sno,
                status: "unused",
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
        totalUploaded += chunk.length;
        console.log(`Uploaded batch of ${chunk.length}, Total: ${totalUploaded}`);
    }

    return totalUploaded;
};

export const deleteSubjectData = async (uid, subjectName) => {
    if (!uid || !subjectName) return;

    try {
        console.log(`Deleting data for subject: ${subjectName}...`);

        const userQuestionsRef = collection(db, USERS_COL, uid, "questions");
        const q = query(userQuestionsRef, where("subject", "==", subjectName));
        const limitBatch = 400;

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const batch = writeBatch(db);
            let count = 0;

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
                count++;
            });

            await batch.commit();
            console.log(`Deleted ${count} questions for ${subjectName}`);
        }

        const userRef = doc(db, USERS_COL, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            const prefs = data.chapterPreferences || {};
            let changed = false;

            Object.keys(prefs).forEach(key => {
                if (key.endsWith(`_${subjectName}`)) {
                    delete prefs[key];
                    changed = true;
                }
            });

            if (changed) {
                await updateDoc(userRef, {
                    chapterPreferences: prefs
                });
                console.log(`Cleared chapter preferences for ${subjectName}`);
            }
        }

        await logUserActivity(uid, 'subject_removed', 'Removed Subject', `${subjectName} and its data were deleted.`);

    } catch (e) {
        console.error("Error wiping subject data:", e);
        throw e;
    }
};
