/* 
====================================
Firestore Database Module
Handles all data operations for Users, Questions, and Papers
====================================
*/

// Import Firebase SDKs (using ES modules via CDN consistent with auth)
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
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Re-use config (ensure this matches firebase-auth.js)
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

// Collection References
const USERS_COL = "users";
const QUESTIONS_COL = "questions";
const PAPERS_COL = "papers";

// ----------------------------------
// 1. User Management
// ----------------------------------

/**
 * Sync User Profile on Login
 * Creates user doc if it doesn't exist.
 */
export const syncUserProfile = async (user) => {
    if (!user) return;

    const userRef = doc(db, USERS_COL, user.uid);

    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("Creating new user profile...");
            // Initial User Doc
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                subjects: [], // Default empty
                classes: [],  // Default empty
                isPremium: false, // EXPLICIT DEFAULT: LOCKED
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

/**
 * Get Full User Profile Data
 */
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

/**
 * Save/Update User Subjects
 */
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

/**
 * Save/Update User Classes
 */
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

/**
 * Save/Update User Chapter Preferences
 * structure: { "Class_Subject": ["Chapter1", "Chapter2"] }
 */
export const saveUserChapterPreferences = async (uid, classSubjectKey, chaptersArray) => {
    try {
        const userRef = doc(db, USERS_COL, uid);
        // We use dot notation to update a specific key in the map
        // Note: Field paths with special characters need handling, but "Class 10_Physics" is fine?
        // Actually, to be safe with dynamic keys in updateDoc, we should use Computed Property Names if possible
        // or just read, merge, and set. 
        // Firestore updateDoc supports "map.key": value.
        await updateDoc(userRef, {
            [`chapterPreferences.${classSubjectKey}`]: chaptersArray
        });
        console.log(`Chapters updated for ${classSubjectKey}`);
    } catch (error) {
        console.error("Error saving chapters:", error);
        // If the map doesn't exist, updateDoc might fail if we try to set a nested field.
        // Fallback to setDoc with merge if needed, but let's try shallow merge first.
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


// ----------------------------------
// 2. Question Bank Operations
// ----------------------------------

/**
 * Add a New Question to Bank
 */
/**
 * Add a New Question to Bank (User Sub-collection)
 * Path: users/{uid}/questions/{docId}
 */
export const addQuestionToBank = async (uid, questionData) => {
    if (!uid) throw new Error("User ID required");

    try {
        // Validate / Format Data
        const qPayload = {
            class: questionData.class || "Unspecified",
            subject: questionData.subject || "Unspecified",
            chapter: questionData.chapter || "Unspecified",
            marks: questionData.marks || "1",
            questionType: questionData.type || "Short Answer", // Standardized key
            questionText: questionData.questionText,

            // MCQ specific
            options: questionData.options || null,
            correctOption: questionData.correctAnswer || null,

            createdAt: serverTimestamp()
        };

        // Reference to User's Questions Subcollection
        // users -> {uid} -> questions -> {docId}
        const userQuestionsRef = collection(db, USERS_COL, uid, "questions");

        const docRef = await addDoc(userQuestionsRef, qPayload);
        console.log("Question added with ID: ", docRef.id);
        return docRef.id;

    } catch (error) {
        console.error("Error adding question:", error);
        throw error;
    }
};

/**
 * Delete Question from Bank
 */
/**
 * Delete Question from Bank
 */
export const deleteQuestionFromBank = async (uid, qId) => {
    if (!uid || !qId) return;
    try {
        await deleteDoc(doc(db, USERS_COL, uid, "questions", qId));
        console.log("Question deleted:", qId);
    } catch (error) {
        console.error("Error deleting question:", error);
        throw error;
    }
};

/**
 * Update Existing Question
 */
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

/**
 * Get User's Questions (Filtered by uid)
 * Optional filters: subject, class
 */
/**
 * Get User's Questions (Filtered by uid)
 * Path: users/{uid}/questions
 */
// Correct path: users/{uid}/questions
export const getUserQuestions = async (uid, filters = {}) => {
    try {
        const userQuestionsRef = collection(db, USERS_COL, uid, "questions");

        // REMOVED orderBy("createdAt", "desc") to avoid composite index requirements on dynamic filters
        // We will sort client-side.
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

        // Client-side Sort (Newest First)
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

/**
 * Get Recent Activity (derived from Questions)
 */
export const getUserActivity = async (uid, limitCount = 5) => {
    try {
        // Just fetch recent questions as "Activity"
        const questions = await getUserQuestions(uid);
        // Logic: Map questions to activity items
        // Since we sort client-side in getUserQuestions, just take top N
        return questions.slice(0, limitCount).map(q => ({
            type: 'question_added',
            title: 'Added Question',
            detail: `${q.class} • ${q.subject}`,
            timestamp: q.createdAt,
            id: q.id
        }));
    } catch (e) {
        console.error("Activity fetch error", e);
        return [];
    }
};


// ----------------------------------
// 3. Paper/Exam Operations
// ----------------------------------

/**
 * Save a Generated Paper Structure
 */
export const savePaperStructure = async (uid, paperData) => {
    try {
        const payload = {
            uid: uid,
            class: paperData.class,
            subject: paperData.subject,
            chapters: paperData.chapters || [],
            // Structure: counts of each marks type
            structure: paperData.structure || {
                mcq: 0,
                twoMark: 0,
                fourMark: 0,
                eightMark: 0
            },
            // Metadata
            examDetails: paperData.examDetails || {
                institution: "",
                examName: "",
                date: "",
                duration: "",
                maxMarks: 0
            },
            // If we generated questions immediately, we could store IDs. 
            // For now just storing structure.
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

/**
 * Get User's Past Papers
 */
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


// ----------------------------------
// 4. License Key System
// ----------------------------------

/**
 * Activate User Account with Key
 * Transactional: Checks key, marks used, updates user.
 */
import { runTransaction } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const activateUserAccount = async (uid, keyString) => {
    if (!uid || !keyString) throw new Error("Invalid details");

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Find the Key Doc
            // We assume keys are stored in 'license_keys' collection. 
            // Querying inside transaction can be tricky if not by ID. 
            //Ideally, the doc ID should be the key itself to make this fast and transactional.
            // Let's assume Doc ID = Key String.

            const keyRef = doc(db, "license_keys", keyString);
            const keySnap = await transaction.get(keyRef);

            if (!keySnap.exists()) {
                throw "Invalid License Key";
            }

            const keyData = keySnap.data();
            if (keyData.status === "used") {
                throw "License Key already used";
            }

            // 2. Get User Doc
            const userRef = doc(db, USERS_COL, uid);
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) {
                throw "User profile not found";
            }

            // 3. Updates
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

/**
 * Batch Upload Keys (Admin Tool)
 * keysList = [{ id: "KEY-123", key: "KEY-123", status: "unused" }, ...]
 */
import { writeBatch } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const batchUploadKeys = async (keysList) => {
    // Firestore batch limit is 500
    const CHUNK_SIZE = 450;
    const chunks = [];

    for (let i = 0; i < keysList.length; i += CHUNK_SIZE) {
        chunks.push(keysList.slice(i, i + CHUNK_SIZE));
    }

    let totalUploaded = 0;

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(k => {
            const ref = doc(db, "license_keys", k.key); // Doc ID is the key
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
