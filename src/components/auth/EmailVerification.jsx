import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EmailVerification() {
    const { currentUser, sendVerificationEmail, refreshUserState, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            setMessage('');
            setError('');
            await sendVerificationEmail();
            setMessage('מייל אימות נשלח בהצלחה! אנא בדוק את תיבת הדואר הנכנס שלך (ואת תיקיית הספאם).');
        } catch (err) {
            setError(`כשלון בשליחת מייל האימות: ${err.message}`);
            console.error('Failed to send verification email:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            setMessage('');
            setError('');

            // Refresh the user state - this will update currentUser.emailVerified
            await refreshUserState();

            // Explicitly check if email is now verified
            if (currentUser && currentUser.emailVerified) {
                // Force a full page refresh to ensure App.jsx re-evaluates conditions
                window.location.reload();
                return; // End function execution here
            }

            // Only show this message if email is still not verified
            setMessage('האימייל עדיין לא אומת. אנא אמת את האימייל שלך ונסה שוב.');

        } catch (err) {
            setError(`שגיאה ברענון המצב: ${err.message}`);
            console.error('Error refreshing user state:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            setError(`שגיאה בהתנתקות: ${err.message}`);
            console.error('Failed to log out:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-md rounded-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        אימות אימייל נדרש
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ברוך הבא, {currentUser.email}! שלחנו לך מייל אימות לכתובת זו. אנא אמת את כתובת האימייל שלך כדי להמשיך.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        <p className="text-center text-sm">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        <p className="text-center text-sm">{message}</p>
                    </div>
                )}

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                        {loading ? 'שולח...' : 'שלח לי מייל אימות חדש'}
                    </button>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'מעביר לחשבון...' : 'כבר אימתתי את האימייל שלי'}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        התנתק
                    </button>
                </div>
            </div>
        </div>
    );
} 