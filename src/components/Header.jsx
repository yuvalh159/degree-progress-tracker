import React from 'react';
import logoSymbol from '../assets/symbol.png'; // Import the logo
import { useAuth } from '../../context/AuthContext'; // Import useAuth
// DEGREE_PROFILES is no longer used here directly for the dropdown

export default function Header({
    currentProfile,
    availableProfiles, // New prop for dynamic profiles
    changeProfile,
    setShowReqEditor,
    setShowDegreeManagerModal // New prop to show the degree manager modal
}) {
    const { currentUser, logout } = useAuth(); // Get auth state and logout function

    const handleLogout = async () => {
        try {
            await logout();
            console.log("Logout successful from Header");
        } catch (error) {
            console.error("Failed to log out from Header:", error);
            // Maybe show an error to the user
        }
    };

    // const logoPath = `${import.meta.env.BASE_URL}symbol.png`; // No longer needed

    return (
        <header className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex items-center">
                <img src={logoSymbol} alt="Logo" className="w-10 h-10 mr-2" />
                <div>
                    <h1 className="text-xl font-medium text-gray-800">מעקב התקדמות</h1>
                    <p className="text-sm text-gray-600 truncate max-w-xs sm:max-w-sm md:max-w-md">
                        {currentUser ? currentUser.email : currentProfile} {/* Show email if logged in, else profile */}
                    </p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <select
                    className="google-input text-sm py-1.5 px-3 w-full sm:w-auto"
                    value={currentProfile}
                    onChange={(e) => changeProfile(e.target.value)}
                >
                    {/* Populate from availableProfiles prop */}
                    {availableProfiles.map(profile => (
                        <option key={profile} value={profile}>{profile}</option>
                    ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowReqEditor(true)}
                        className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        דרישות
                    </button>
                    {/* New Button to manage degree profiles */}
                    <button
                        onClick={() => setShowDegreeManagerModal(true)}
                        className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap"
                    >
                        נהל מסלולים
                    </button>
                    {/* Logout button - shown only if user is logged in */}
                    {currentUser && (
                        <button
                            onClick={handleLogout}
                            className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                        >
                            התנתק (Log Out)
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
} 