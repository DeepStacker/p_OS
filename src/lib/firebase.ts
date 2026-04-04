import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Simulation Mode Guard
const hasFirebaseKeys = !!firebaseConfig.apiKey;

let app;
try {
    if (hasFirebaseKeys) {
        app = initializeApp(firebaseConfig);
    } else {
        console.warn("Firebase: Configuration keys missing. Using development mode.");
        app = initializeApp({ apiKey: "dev-key", projectId: "node-system-dev" });
    }
} catch (err) {
    console.error("Firebase Initialization Failure:", err);
    app = initializeApp({ apiKey: "err-key", projectId: "node-system-err" });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const logActivity = async (userId: string, type: string, action: string) => {
    try {
        await addDoc(collection(db, "activity_logs"), {
            userId,
            type,
            action,
            timestamp: serverTimestamp()
        });
    } catch (err) {
        console.error("Activity Logging Failed:", err);
    }
};
