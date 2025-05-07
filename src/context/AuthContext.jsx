import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    reload
} from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import the auth instance

// Create the context
const AuthContext = createContext();

// Custom hook to use the Auth context
export function useAuth() {
    return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Authentication Functions ---

    async function signup(email, password) {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Send verification email
        await sendEmailVerification(userCredential.user);
        return userCredential;
    }

    function login(email, password) {
        // Returns a promise that resolves with userCredential on success
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        // Returns a promise that resolves when sign out is complete
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // New function to send verification email
    function sendVerificationEmail(user = currentUser) {
        if (!user) throw new Error("No user is logged in");
        return sendEmailVerification(user);
    }

    // New function to refresh the user state
    async function refreshUserState() {
        try {
            if (auth.currentUser) {
                // Reload the user's data from Firebase
                await reload(auth.currentUser);

                // Use the updated currentUser directly from auth
                // This ensures we're using the latest user data
                setCurrentUser(null); // First set to null to force re-render
                setTimeout(() => {
                    // Then set to the current auth user to ensure we get updated data
                    setCurrentUser(auth.currentUser);
                }, 100);
            }
        } catch (err) {
            console.error("Error refreshing user state:", err);
            throw err;
        }
    }

    // --- Effect for Auth State Listener ---

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            console.log("Auth State Changed: ", user ? `User UID: ${user.uid}, Email Verified: ${user.emailVerified}` : "No User");
        });
        return unsubscribe; // Cleanup on unmount
    }, []);

    // --- Context Value ---

    // Memoize the context value
    const value = useMemo(() => ({
        currentUser,
        loading,
        signup,
        login,
        logout,
        resetPassword,
        sendVerificationEmail,
        refreshUserState
    }), [currentUser, loading]);

    // --- Render Provider ---

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 