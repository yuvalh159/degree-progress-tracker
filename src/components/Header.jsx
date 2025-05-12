import React from 'react';
import logoSymbol from '/symbol.png'; // Import the logo from public directory
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTour } from '@reactour/tour';
// DEGREE_PROFILES is no longer used here directly for the dropdown

export default function Header({
    currentProfile,
    availableProfiles, // New prop for dynamic profiles
    changeProfile,
    setShowReqEditor,
    setShowDegreeManagerModal,
    onStartTourRequest,
    isGuest, // New prop: boolean indicating if the user is a guest
    onLogout // New prop: function to handle logout or exiting guest mode (passed from App.jsx)
}) {
    const { currentUser, logout: contextLogout } = useAuth(); // Get auth state and actual logout function from context
    const { setIsOpen, setCurrentStep } = useTour();

    const handlePrimaryAction = async () => {
        if (isGuest) {
            if (typeof onLogout === 'function') {
                onLogout(); // This will call exitGuestMode() via App.jsx
            }
        } else if (currentUser) {
            try {
                await contextLogout(); // Call the actual logout from AuthContext
                console.log("Logout successful from Header");
            } catch (error) {
                console.error("Failed to log out from Header:", error);
            }
        }
    };

    // const logoPath = `${import.meta.env.BASE_URL}symbol.png`; // No longer needed

    return (
        <header className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 sm:gap-0 w-full">
            <div className="flex items-center">
                <img src={logoSymbol} alt="Site Logo" className="w-40 h-40 mr-4" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {!isGuest && (
                    <select
                        className="google-input text-sm py-1.5 px-3 w-full sm:w-auto header-profile-selector"
                        value={currentProfile}
                        onChange={(e) => changeProfile(e.target.value)}
                        disabled={isGuest}
                    >
                        {availableProfiles.map(profile => (
                            <option key={profile} value={profile}>{profile}</option>
                        ))}
                    </select>
                )}
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={onStartTourRequest}
                        className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap"
                        title="הפעל סיור הדרכה"
                    >
                        סיור הדרכה
                    </button>
                    <button
                        onClick={() => setShowReqEditor(true)}
                        className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap requirements-button"
                        disabled={isGuest}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        דרישות
                    </button>
                    <button
                        onClick={() => setShowDegreeManagerModal(true)}
                        className="google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap"
                        disabled={isGuest}
                    >
                        נהל מסלולים
                    </button>
                    {(currentUser || isGuest) && (
                        <button
                            onClick={handlePrimaryAction}
                            className={`google-btn-secondary flex-1 sm:flex-initial flex items-center justify-center text-sm py-1.5 px-3 whitespace-nowrap ${isGuest ? 'bg-green-50 hover:bg-green-100 border-green-300 text-green-700' : 'bg-red-50 hover:bg-red-100 border-red-300 text-red-700'}`}
                        >
                            {isGuest ? "התחבר / הרשם" : "התנתק"}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
} 