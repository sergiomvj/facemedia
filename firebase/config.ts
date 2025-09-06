import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration, as provided by you.
const firebaseConfig = {
  apiKey: "AIzaSyCgQUWRQF0gEtRGMxHz10aQnydFJwDw57I",
  authDomain: "facemedia-c3cc9.firebaseapp.com",
  projectId: "facemedia-c3cc9",
  storageBucket: "facemedia-c3cc9.firebasestorage.app",
  messagingSenderId: "743893354665",
  appId: "1:743893354665:web:787963e3944cedf6bfc1b8",
  measurementId: "G-45XZY4SGK9"
};

// A check to prevent the app from crashing if the config is missing.
if (!firebaseConfig || !firebaseConfig.apiKey) {
    const rootDiv = document.getElementById('root');
    const errorMessageHTML = `
        <div style="font-family: sans-serif; padding: 2rem; color: #fecaca; background-color: #450a0a; border: 1px solid #991b1b; margin: 2rem; border-radius: 0.5rem;">
            <h1 style="font-size: 1.5rem; font-weight: bold; color: #fef2f2;">Configuration Error</h1>
            <p style="color: #fee2e2;">Firebase configuration is missing or invalid. To fix this, open the <code>firebase/config.ts</code> file in the editor and paste your Firebase project's configuration object. This is a necessary step to enable user authentication.</p>
        </div>
    `;
    if (rootDiv) {
        rootDiv.innerHTML = errorMessageHTML;
    }
    // Throwing an error stops further script execution.
    throw new Error("Firebase config is missing or invalid in firebase/config.ts");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
