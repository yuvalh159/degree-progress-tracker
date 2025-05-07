// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Import Auth and Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Keep if you have analytics config
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration read from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // Conditionally add measurementId if the env var exists
    ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID })
};

// Optional: Check if all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
    console.error("Firebase config is missing required environment variables:", missingKeys.join(', '));
    // You might want to throw an error or handle this case more gracefully
}

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Error initializing Firebase app:", error);
    // Handle initialization error appropriately
}

// Initialize Firebase services, ensure app was initialized
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
// const analytics = app && firebaseConfig.measurementId ? getAnalytics(app) : null;

// Export the services for use in other parts of your app
export { app, auth, db };