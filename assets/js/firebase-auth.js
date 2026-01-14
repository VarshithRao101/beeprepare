
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { syncUserProfile } from './firestore.js';

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        storeUserSession(user);

        await syncUserProfile(user);

        console.log("User signed in & synced:", user.displayName);
        window.location.href = "home.html";

    } catch (error) {
        if (error.code === 'auth/cancelled-popup-request') {
            console.warn("Login popup cancelled by user/browser.");
        } else {
            console.error("Login Failed:", error.message);
            alert("Login failed: " + error.message);
        }
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('qp_user');
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

export const checkAuth = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            storeUserSession(user);
            console.log("Auth Check: Logged In");

            if (window.location.pathname.includes("login.html")) {
                window.location.href = "home.html";
            }
        } else {
            console.log("Auth Check: Signed Out");
            localStorage.removeItem('qp_user');

            if (!window.location.pathname.includes("login.html")) {
                window.location.href = "login.html";
            }
        }
    });
};

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

export const updateProfileUI = () => {
    const data = localStorage.getItem('qp_user');
    if (!data) return;

    const user = JSON.parse(data);

    const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-lg');
    avatars.forEach(img => {
        if (user.photoURL && !img.src.includes('googleusercontent')) {
            img.src = user.photoURL;
        }
    });

    const nameEl = document.querySelector('.profile-name, .profile-name-display');
    if (nameEl) nameEl.textContent = user.displayName;

    const emailEl = document.querySelector('.profile-email, .profile-email-display');
    if (emailEl) emailEl.textContent = user.email;
};

checkAuth();
