/* 
====================================
Firebase Authentication Module
====================================
*/

// Import Firebase SDKs (using ES modules via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase Configuration (Placeholders as requested, though user provided keys in prompt)
// Using user provided keys for functionality since they explicitly pasted them
const firebaseConfig = {
    apiKey: "AIzaSyD2tMnUB37paF5qoVD3ahp7Q3IKMIoHghw",
    authDomain: "beeprepare-a4e5d.firebaseapp.com",
    projectId: "beeprepare-a4e5d",
    storageBucket: "beeprepare-a4e5d.firebasestorage.app",
    messagingSenderId: "127936798358",
    appId: "1:127936798358:web:4d7a1291f6a12c686fecb7",
    measurementId: "G-XXPN9T2P74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Import Firestore Sync
import { syncUserProfile } from './firestore.js';

// ----------------------------------
// Auth Functions
// ----------------------------------

/**
 * Sign In with Google Popup
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Store temp session data
        storeUserSession(user);

        // Sync with Firestore (Create doc if new)
        await syncUserProfile(user);

        console.log("User signed in & synced:", user.displayName);
        window.location.href = "home.html";

    } catch (error) {
        if (error.code === 'auth/cancelled-popup-request') {
            console.warn("Login popup cancelled by user/browser.");
            // Don't alert for cancellation
        } else {
            console.error("Login Failed:", error.message);
            alert("Login failed: " + error.message);
        }
        throw error;
    }
};

/**
 * Sign Out User
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('qp_user');
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

/**
 * Check Auth State & Protect Routes
 * Should be called on every protected page load
 */
export const checkAuth = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            storeUserSession(user);
            console.log("Auth Check: Logged In");

            // If on login page, go to home
            if (window.location.pathname.includes("login.html")) {
                window.location.href = "home.html";
            }
        } else {
            // User is signed out
            console.log("Auth Check: Signed Out");
            localStorage.removeItem('qp_user');

            // Redirect to login if not already there, and not on public pages if any
            if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("google-auth.html")) {
                // Save current URL to return after login? For now just go to login.
                window.location.href = "login.html";
            }
        }
    });
};

/**
 * Helper: Store basic user info in LocalStorage
 */
const storeUserSession = (user) => {
    const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
    };
    localStorage.setItem('qp_user', JSON.stringify(userData));
    updateProfileUI();
};

/**
 * Helper: Update Profile UI elements if they exist on the page
 */
export const updateProfileUI = () => {
    const data = localStorage.getItem('qp_user');
    if (!data) return;

    const user = JSON.parse(data);

    // Update Avatar
    const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-lg');
    avatars.forEach(img => {
        if (user.photoURL && !img.src.includes('googleusercontent')) { // Avoid flicker
            img.src = user.photoURL;
        }
    });

    // Update Name
    const nameEl = document.querySelector('.profile-name, .profile-name-display');
    if (nameEl) nameEl.textContent = user.displayName;

    // Update Email
    const emailEl = document.querySelector('.profile-email, .profile-email-display');
    if (emailEl) emailEl.textContent = user.email;
};

// Auto-run auth check
checkAuth();
