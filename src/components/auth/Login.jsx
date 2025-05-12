import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import logoSymbol from '/symbol.png'; // Updated import path
// TODO: Import routing mechanism (e.g., useNavigate from react-router-dom) if needed for redirect

export default function Login({ onSwitchToSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For success/info messages
    const [loading, setLoading] = useState(false);
    const { login, resetPassword, enterGuestMode } = useAuth(); // Get login, resetPassword, and enterGuestMode functions from context
    // const navigate = useNavigate(); // If using react-router-dom

    // State for the password reset view
    const [showResetView, setShowResetView] = useState(false);
    const [resetEmailInput, setResetEmailInput] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true); // Set loading true for login action
        try {
            await login(email, password);
            // App.jsx handles redirect/UI change on successful login
        } catch (err) {
            setError(`ההתחברות נכשלה: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = async () => {
        setMessage('');
        setError('');
        setLoading(true); // Set loading true for guest mode action
        try {
            await enterGuestMode();
            // App.jsx will detect isGuest and render main content
        } catch (err) {
            setError(`כניסה כאורח נכשלה: ${err.message}`);
            // It's unlikely enterGuestMode itself will fail unless logout within it fails.
        } finally {
            setLoading(false);
        }
    };

    const toggleResetView = () => {
        setShowResetView(!showResetView);
        setError('');
        setMessage('');
        setResetEmailInput(''); // Clear reset email input when toggling
    };

    const handleSendResetLink = async (e) => {
        e.preventDefault(); // If it's part of a form
        if (!resetEmailInput) {
            setError('אנא הזן כתובת אימייל.');
            return;
        }
        setError('');
        setMessage('');
        try {
            setLoading(true);
            await resetPassword(resetEmailInput);
            setMessage('נשלח מייל לאיפוס סיסמה. בדוק את תיבת הדואר הנכנס שלך (כולל תיקיית ספאם).');
            // Optionally, hide reset view after sending: setShowResetView(false);
        } catch (err) {
            setError(`שליחת מייל לאיפוס סיסמה נכשלה: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl border border-stone-200">
                {/* Logo and Site Title */}
                <div className="flex flex-col items-center mb-3">
                    <img src={logoSymbol} alt="Site Logo" className="w-56 h-56" />
                </div>

                {!showResetView ? (
                    // Login View
                    <>
                        <div>
                            <h2 className="text-center text-2xl font-bold text-gray-700">
                                התחברות
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                            {error && (
                                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    <p className="text-center text-sm">{error}</p>
                                </div>
                            )}
                            {message && (
                                <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                    <p className="text-center text-sm">{message}</p>
                                </div>
                            )}
                            <input type="hidden" name="remember" defaultValue="true" />
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="email-address" className="sr-only">Email address</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="google-input appearance-none rounded-none relative block w-full px-3 py-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                        placeholder="כתובת אימייל"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="google-input appearance-none rounded-none relative block w-full px-3 py-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                        placeholder="סיסמה"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={toggleResetView}
                                        className="font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
                                        disabled={loading}
                                    >
                                        שכחתי סיסמה?
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center google-btn-primary py-2 px-4 text-sm disabled:opacity-50"
                                >
                                    {loading && !showResetView ? 'מתחבר...' : 'התחבר'}
                                </button>
                            </div>
                        </form>
                        {/* Guest Mode Button - Added Below Login Form */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleGuestMode}
                                disabled={loading}
                                className="group relative w-full flex justify-center google-btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                            >
                                המשך כאורח
                            </button>
                        </div>

                        <div className="text-sm text-center mt-6">
                            <span>אין לך חשבון? </span>
                            <button onClick={onSwitchToSignup} className="font-medium text-teal-600 hover:text-teal-500">
                                צור חשבון
                            </button>
                        </div>
                    </>
                ) : (
                    // Password Reset View
                    <>
                        <div>
                            <h2 className="text-center text-2xl font-bold text-gray-700">
                                איפוס סיסמה
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSendResetLink}>
                            {error && (
                                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    <p className="text-center text-sm">{error}</p>
                                </div>
                            )}
                            {message && (
                                <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                    <p className="text-center text-sm">{message}</p>
                                </div>
                            )}
                            <div className="rounded-md shadow-sm">
                                <div>
                                    <label htmlFor="reset-email-address" className="sr-only">Email address</label>
                                    <input
                                        id="reset-email-address"
                                        name="reset-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="google-input appearance-none rounded-md relative block w-full px-3 py-2 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                        placeholder="כתובת אימייל לאיפוס"
                                        value={resetEmailInput}
                                        onChange={(e) => setResetEmailInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center google-btn-primary py-2 px-4 text-sm disabled:opacity-50"
                                >
                                    {loading && showResetView ? 'שולח לינק...' : 'שלח לינק לאיפוס'}
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleResetView}
                                    disabled={loading}
                                    className="group relative w-full flex justify-center google-btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                                >
                                    ביטול
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
} 