import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
// TODO: Import routing mechanism (e.g., useNavigate from react-router-dom) if needed for redirect

export default function Signup({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth(); // Get signup function from context
    // const navigate = useNavigate(); // If using react-router-dom

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Add password confirmation check
        if (password !== confirmPassword) {
            return setError('הסיסמאות אינן תואמות');
        }

        try {
            setError('');
            setMessage('');
            setLoading(true);
            await signup(email, password);
            setMessage(
                'הרשמה הצליחה! שלחנו מייל אימות לכתובת שלך. אנא בדוק את הדואר הנכנס שלך ולחץ על הקישור לאימות האימייל שלך.'
            );
            // Don't redirect - let the user read the message
        } catch (err) {
            console.error("Signup failed:", err);
            setError(`יצירת החשבון נכשלה: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-md rounded-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        הרשמה (Sign Up)
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                className="google-input appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
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
                                autoComplete="new-password"
                                required
                                minLength={6} // Enforce Firebase minimum password length
                                className="google-input appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="סיסמה (לפחות 6 תווים)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="google-input appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                placeholder="אימות סיסמה"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center google-btn-primary py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {loading ? 'יוצר חשבון...' : 'צור חשבון'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <span>יש לך כבר חשבון? </span>
                    <button
                        onClick={onSwitchToLogin}
                        className="font-medium text-orange-600 hover:text-orange-500"
                        disabled={loading}
                    >
                        התחבר (Log In)
                    </button>
                </div>
            </div>
        </div>
    );
} 