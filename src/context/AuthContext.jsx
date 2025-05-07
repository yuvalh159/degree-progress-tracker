import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
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

    function signup(email, password) {
        // Returns a promise that resolves with userCredential on success
        return createUserWithEmailAndPassword(auth, email, password);
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

    // --- Effect for Auth State Listener ---

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            console.log("Auth State Changed: ", user ? `User UID: ${user.uid}` : "No User");
        });
        return unsubscribe; // Cleanup on unmount
    }, []);

    // --- Context Value ---

    // Memoize the context value
    const value = useMemo(() => ({
        currentUser,
        loading,
        signup, // Provide signup function
        login,  // Provide login function
        logout, // Provide logout function
        resetPassword // Provide resetPassword function
    }), [currentUser, loading]); // Dependencies: currentUser, loading (functions don't need to be deps as they derive from auth instance which is stable)

    // --- Render Provider ---

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 