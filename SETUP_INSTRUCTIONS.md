# 🛠️ Question Paper Bee - Setup & Troubleshooting Guide

It looks like you are running the app by directly opening the files (or using the simple shortcut). **Modern web apps with Modules and Firebase require a secure "Local Server" environment to work.** They cannot run directly from the file system (`file:///C:/...`) due to browser security rules (CORS).

## 🚨 IMMEDIATE FIX: Use a Local Server
To make the app work, you **cannot** just double-click `index.html`.

### Option A: VS Code (Recommended)
1. Open this folder in **VS Code**.
2. Install the extension **"Live Server"** (by Ritwick Dey).
3. Right-click on `index.html` and choose **"Open with Live Server"**.
4. The app will open in your browser (usually at `http://127.0.0.1:5500`) and everything will work!

### Option B: Python (If installed)
1. Open a terminal in this folder.
2. Run: `python -m http.server`
3. Go to `http://localhost:8000` in your browser.

---

## 🔥 Firebase Manual Setup (Required)
The code is connected to your Firebase project `beeprepare-a4e5d`, but you must manually enable the services in the Google Firebase Console for it to function.

### 1. Enable Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project **beeprepare**.
3. Go to **Authentication** (in the left menu).
4. Click **Get Started**.
5. Click **Sign-in method** tab.
6. Select **Google**.
7. Toggle **Enable** switch.
8. Enter your support email and click **Save**.

### 2. Enable Firestore Database
1. Go to **Firestore Database** (in the left menu).
2. Click **Create Database**.
3. Choose **Start in Test Mode** (this allows reading/writing while you develop).
   - *Note: Test rules expire in 30 days. Secure them later.*
4. Select a location (e.g., `nam5 (us-central)` or nearest to you).
5. Click **Enable**.

### 3. Check Authorized Domains
1. In **Authentication** -> **Settings** -> **Authorized Domains**.
2. Ensure `localhost` and `127.0.0.1` are in the list.
3. If you use a custom domain later, add it here.

---

## 🏗️ Structure Overview
- **`pages/`**: Contains all HTML screens.
- **`assets/js/`**:
  - `firebase-auth.js`: Handles Login/Logout.
  - `firestore.js`: Handles Database (Users, Questions).
  - `questionBank.js`: Logic for adding/fetching questions.
  - `createPaper.js`: Logic for generating paper drafts.
  - `previewEditor.js`: Logic for editing the preview.
  - `paperSave.js`: Logic for saving final papers.
  - `pdfGenerator.js`: Logic for downloading PDFs.

## ⚠️ Common Errors
- **"Cross origin requests are only supported for..."**: You are not using a local server. See Option A above.
- **"Firebase: Error (auth/unauthorized-domain)"**: You are running on a domain/IP not listed in Firebase Console.
- **"Missing or insufficient permissions"**: You didn't enable Firestore or set Rules to Test Mode.
